"""
COS WorkSense — FastAPI Backend (port 8003).
Enterprise cognitive workforce intelligence. Standalone.
"""

import os
import uuid
import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional
from collections import Counter, defaultdict

from fastapi import FastAPI, Request, HTTPException, Header, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
from jose import jwt, JWTError
import psutil

from database import _get_conn, init_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ─── Config ────────────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("COS_WS_JWT_SECRET", "cos-worksense-secret-8003")
JWT_ALGORITHM = "HS256"
HIDDEN_PROCESSES = {
    "System Idle Process", "System", "Registry", "smss.exe", "csrss.exe",
    "wininit.exe", "services.exe", "lsass.exe", "Memory Compression",
    "Secure System", "dwm.exe", "audiodg.exe",
}
PROTECTED_PROCESSES = set(HIDDEN_PROCESSES) | {"explorer.exe", "chrome.exe"}

DISTRACTION_APPS = ["youtube", "instagram", "facebook", "twitter", "netflix", "tiktok", "reddit"]
PRODUCTIVE_APPS = ["vscode", "pycharm", "figma", "notion", "excel", "word", "terminal", "github"]


def calculate_focus_score(context_switches: int, session_minutes: int, is_idle: bool, app: str) -> int:
    base = 100
    if is_idle:
        return 5
    base -= min(context_switches * 4, 60)
    base += min(session_minutes // 10, 20)
    if any(d in app.lower() for d in DISTRACTION_APPS):
        base -= 40
    if any(p in app.lower() for p in PRODUCTIVE_APPS):
        base += 10
    return max(0, min(100, base))


def get_status(focus_score: int, context_switches: int, is_idle: bool) -> dict:
    if is_idle:
        return {"label": "idle", "color": "red", "emoji": "🔴"}
    if focus_score >= 85 and context_switches <= 3:
        return {"label": "deep_focus", "color": "green", "emoji": "🟢"}
    if focus_score >= 70 and context_switches <= 7:
        return {"label": "focused", "color": "green", "emoji": "🟢"}
    if focus_score >= 50 and context_switches <= 15:
        return {"label": "distracted", "color": "yellow", "emoji": "🟡"}
    return {"label": "off_task", "color": "red", "emoji": "🔴"}


def get_improvement_tip(avg_focus: float, avg_switches: float, avg_session: float, idle_pct: float) -> str:
    if idle_pct > 20:
        return "High idle time — check for blockers"
    if avg_switches > 15:
        return "Too many switches — try 90min focus blocks"
    if avg_session < 20:
        return "Sessions too short — encourage deeper blocks"
    if avg_focus < 50:
        return "Low focus — reduce notifications"
    return "Performing well — maintain patterns"


def _focus_bar(score: int) -> str:
    filled = min(5, max(0, round((score or 0) / 20)))
    return "█" * filled + "░" * (5 - filled)


def _hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def _check_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def _create_token(payload: dict) -> str:
    p = dict(payload)
    p["exp"] = (datetime.utcnow() + timedelta(hours=24)).timestamp()
    return jwt.encode(p, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return {}


def _org_code(name: str) -> str:
    return f"{''.join(c for c in name.upper() if c.isalnum())[:4] or 'ORG'}-{datetime.now().year}"


_manager_ws: dict = {}
_guardian_ws: list = []
_guardian_events = []
_switch_queue = []

# Drift intervention state
_current_intervention: dict | None = None
_intervention_websockets: set = set()

app = FastAPI(title="COS WorkSense", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5176", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Pydantic ──────────────────────────────────────────────────────────────
class OrgCreate(BaseModel):
    org_name: str
    manager_email: str
    manager_password: str
    team_size: int = 10


class ManagerAuth(BaseModel):
    manager_email: str
    manager_password: str


class EmployeeAuth(BaseModel):
    emp_code: str
    temp_password: str


class SnapshotBody(BaseModel):
    app: str
    title: str
    focus_score: Optional[int] = None
    context_switches: int = 0
    session_minutes: int = 0
    is_idle: bool = False


class TabSwitchBody(BaseModel):
    from_app: str
    from_title: str
    from_focus_score: int = 0
    from_session_minutes: int = 0
    to_app: str
    to_title: str


class TabSwitchReturnedBody(BaseModel):
    switch_id: int
    returned: bool = False


class SystemAlertBody(BaseModel):
    alert_type: str
    value: Optional[str] = None
    detail: Optional[str] = None
    timestamp: Optional[str] = None


class GoalsBody(BaseModel):
    goals: list


class KillProcessBody(BaseModel):
    pid: int


def _extract_emp(auth: str):
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    p = _decode_token(auth.replace("Bearer ", "").strip())
    if not p or p.get("role") != "employee":
        raise HTTPException(status_code=403, detail="Employee token required")
    return p


def _extract_mgr(auth: str):
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    p = _decode_token(auth.replace("Bearer ", "").strip())
    if not p or p.get("role") != "manager":
        raise HTTPException(status_code=403, detail="Manager token required")
    return p


async def _broadcast_managers(org_id: str, msg: dict):
    for ws in _manager_ws.get(org_id, []):
        try:
            await ws.send_text(json.dumps(msg))
        except Exception:
            pass


# ─── Health ───────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    try:
        _get_conn().execute("SELECT 1")
        db_ok = True
    except Exception:
        db_ok = False
    return {"status": "ok", "version": "COS WorkSense 1.0", "port": 8003, "db_connected": db_ok}


# ─── Org & Auth ───────────────────────────────────────────────────────────
@app.post("/org/create")
async def org_create(body: OrgCreate):
    org_id = str(uuid.uuid4())
    org_code = _org_code(body.org_name)
    manager_pw = _hash_pw(body.manager_password)
    conn = _get_conn()
    try:
        conn.execute(
            "INSERT INTO organizations (org_id, org_name, org_code, manager_email, manager_pw) VALUES (?,?,?,?,?)",
            (org_id, body.org_name, org_code, body.manager_email, manager_pw),
        )
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))
    employees_out = []
    for i in range(1, min(body.team_size, 101) + 1):
        emp_id = str(uuid.uuid4())
        emp_code = f"EMP{i:03d}-{org_code}"
        temp_pw = uuid.uuid4().hex[:10]
        conn.execute(
            "INSERT INTO employees (emp_id, org_id, emp_code, temp_pw, name) VALUES (?,?,?,?,?)",
            (emp_id, org_id, emp_code, _hash_pw(temp_pw), f"Employee {i}"),
        )
        employees_out.append({"emp_code": emp_code, "temp_password": temp_pw, "emp_id": emp_id})
    conn.commit()
    conn.close()
    manager_token = _create_token({"role": "manager", "org_id": org_id, "email": body.manager_email})
    logger.info(f"[WorkSense] Org created: {body.org_name} · {body.team_size} employees")
    return {"org_id": org_id, "org_code": org_code, "manager_token": manager_token, "employees": employees_out}


@app.post("/auth/manager")
async def auth_manager(body: ManagerAuth):
    conn = _get_conn()
    row = conn.execute("SELECT org_id, org_name, manager_pw FROM organizations WHERE manager_email = ?", (body.manager_email,)).fetchone()
    conn.close()
    if not row or not _check_pw(body.manager_password, row["manager_pw"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    conn = _get_conn()
    count = conn.execute("SELECT COUNT(*) as c FROM employees WHERE org_id = ?", (row["org_id"],)).fetchone()["c"]
    conn.close()
    token = _create_token({"role": "manager", "org_id": row["org_id"], "email": body.manager_email})
    return {"manager_token": token, "org_id": row["org_id"], "org_name": row["org_name"], "employee_count": count}


@app.post("/auth/employee")
async def auth_employee(body: EmployeeAuth):
    conn = _get_conn()
    row = conn.execute(
        "SELECT e.emp_id, e.org_id, e.temp_pw, o.org_name FROM employees e JOIN organizations o ON e.org_id = o.org_id WHERE e.emp_code = ?",
        (body.emp_code,),
    ).fetchone()
    conn.close()
    if not row or not _check_pw(body.temp_password, row["temp_pw"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = _create_token({"role": "employee", "emp_id": row["emp_id"], "org_id": row["org_id"], "emp_code": body.emp_code})
    return {"emp_token": token, "emp_id": row["emp_id"], "org_id": row["org_id"], "org_name": row["org_name"]}


# ─── Employee snapshot & tab-switch ────────────────────────────────────────
@app.post("/employee/snapshot")
async def employee_snapshot(body: SnapshotBody, authorization: str = Header(None)):
    p = _extract_emp(authorization)
    focus = body.focus_score if body.focus_score is not None else calculate_focus_score(
        body.context_switches, body.session_minutes, body.is_idle, body.app
    )
    status = get_status(focus, body.context_switches, body.is_idle)
    conn = _get_conn()
    conn.execute(
        """INSERT INTO employee_snapshots (emp_id, org_id, app, title, focus_score, context_switches, session_minutes, is_idle)
           VALUES (?,?,?,?,?,?,?,?)""",
        (p["emp_id"], p["org_id"], body.app, body.title, focus, body.context_switches, body.session_minutes, int(body.is_idle)),
    )
    conn.commit()
    conn.close()
    logger.info(f"[WorkSense] Snap: {p.get('emp_code','')} · {body.app} · focus:{focus}")
    msg = {
        "type": "snapshot_update",
        "employee": {"emp_id": p["emp_id"], "current_app": body.app, "focus_score": focus, "status": status["label"]},
        "team_summary": {},
    }
    await _broadcast_managers(p["org_id"], msg)
    return {"status": "stored"}


@app.post("/employee/tab-switch")
async def employee_tab_switch(body: TabSwitchBody, authorization: str = Header(None)):
    p = _extract_emp(authorization)
    conn = _get_conn()
    cur = conn.execute(
        """INSERT INTO tab_switches (emp_id, org_id, from_app, from_title, from_focus_score, from_session_minutes, to_app, to_title)
           VALUES (?,?,?,?,?,?,?,?)""",
        (p["emp_id"], p["org_id"], body.from_app, body.from_title, body.from_focus_score, body.from_session_minutes, body.to_app, body.to_title),
    )
    switch_id = cur.lastrowid
    conn.commit()
    conn.close()
    evt = {"type": "app_switch", "from_app": body.from_app, "from_title": body.from_title, "from_focus_score": body.from_focus_score, "from_session_minutes": body.from_session_minutes, "should_show_guardian": True}
    _guardian_events.append(evt)
    for ws in _guardian_ws[:]:
        try:
            await ws.send_text(json.dumps(evt))
        except Exception:
            pass
    return {
        "switch_id": switch_id,
        "should_show_guardian": True,
        "guardian_message": f"You were working on {body.from_title} in {body.from_app}",
        "previous_context": {"app": body.from_app, "title": body.from_title, "focus_score": body.from_focus_score, "session_minutes": body.from_session_minutes},
    }


@app.post("/employee/tab-switch/returned")
async def employee_tab_switch_returned(body: TabSwitchReturnedBody, authorization: str = Header(None)):
    _extract_emp(authorization)
    conn = _get_conn()
    conn.execute("UPDATE tab_switches SET user_returned = ? WHERE id = ?", (int(body.returned), body.switch_id))
    row = conn.execute("SELECT from_app, from_title FROM tab_switches WHERE id = ?", (body.switch_id,)).fetchone()
    conn.commit()
    conn.close()
    if not row:
        return {"resume_app": None, "resume_title": None}
    return {"resume_app": row["from_app"], "resume_title": row["from_title"]}


@app.post("/employee/system-alert")
async def employee_system_alert(body: SystemAlertBody, authorization: str = Header(None)):
    p = _extract_emp(authorization)
    conn = _get_conn()
    conn.execute(
        "INSERT INTO system_alerts (emp_id, org_id, alert_type, value, detail, timestamp) VALUES (?,?,?,?,?,?)",
        (p["emp_id"], p["org_id"], body.alert_type, body.value or "", body.detail or "", body.timestamp or datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()
    await _broadcast_managers(p["org_id"], {"type": "system_alert", "alert": {"emp_id": p["emp_id"], "alert_type": body.alert_type, "value": body.value}})
    for ws in _guardian_ws[:]:
        try:
            await ws.send_text(json.dumps({"type": "app_switch", "alert_type": body.alert_type, "from_app": body.value, "from_title": f"Using {body.value}% CPU"}))
        except Exception:
            pass
    return {"status": "received"}


@app.post("/employee/goals")
async def employee_goals(body: GoalsBody, authorization: str = Header(None)):
    p = _extract_emp(authorization)
    conn = _get_conn()
    conn.execute(
        "INSERT OR REPLACE INTO employee_goals (emp_id, goals_json, date) VALUES (?,?,date('now'))",
        (p["emp_id"], json.dumps(body.goals)),
    )
    conn.commit()
    conn.close()
    return {"status": "saved", "goals": body.goals}


@app.get("/employee/my-performance")
async def employee_my_performance(authorization: str = Header(None)):
    p = _extract_emp(authorization)
    conn = _get_conn()
    since = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    rows = conn.execute(
        "SELECT focus_score, context_switches, session_minutes, is_idle FROM employee_snapshots WHERE emp_id = ? AND timestamp >= ?",
        (p["emp_id"], since),
    ).fetchall()
    conn.close()
    if not rows:
        return {"avg_focus_score": 0, "avg_context_switches": 0, "total_focus_hours": 0, "burnout_risk": "low", "achievements": [], "trend": "stable"}
    rows = [dict(r) for r in rows]
    avg_focus = sum(r["focus_score"] for r in rows) / len(rows)
    avg_switches = sum(r["context_switches"] for r in rows) / len(rows)
    focus_hours = sum(r["session_minutes"] for r in rows if r["focus_score"] >= 70) / 60
    burnout = "high" if (avg_focus < 50 and focus_hours > 10) else ("medium" if (avg_focus < 60 or focus_hours > 10) else "low")
    achievements = []
    if avg_focus >= 80:
        achievements.append("🔥 Top Performer")
    if avg_switches < 5:
        achievements.append("🎯 Focus Master")
    if focus_hours >= 5:
        achievements.append("⚡ Deep Worker")
    return {
        "avg_focus_score": round(avg_focus, 1),
        "avg_context_switches": round(avg_switches, 1),
        "total_focus_hours": round(focus_hours, 1),
        "burnout_risk": burnout,
        "achievements": achievements,
        "trend": "improving" if avg_focus >= 70 else ("stable" if avg_focus >= 50 else "declining"),
    }


# ─── Manager dashboard ────────────────────────────────────────────────────
@app.get("/manager/dashboard")
async def manager_dashboard(authorization: str = Header(None)):
    p = _extract_mgr(authorization)
    org_id = p["org_id"]
    conn = _get_conn()
    org_row = conn.execute("SELECT org_name FROM organizations WHERE org_id = ?", (org_id,)).fetchone()
    org_name = org_row["org_name"] if org_row else "Unknown"
    emp_rows = conn.execute("SELECT emp_id, emp_code, name FROM employees WHERE org_id = ? AND is_active = 1", (org_id,)).fetchall()
    employees_out = []
    total_focus = 0
    counts = {"deep_focus": 0, "focused": 0, "distracted": 0, "off_task": 0, "idle": 0}
    online = 0
    for emp in emp_rows:
        snap = conn.execute(
            "SELECT * FROM employee_snapshots WHERE emp_id = ? ORDER BY timestamp DESC LIMIT 1",
            (emp["emp_id"],),
        ).fetchone()
        if snap:
            snap = dict(snap)
            st = get_status(snap["focus_score"], snap["context_switches"], bool(snap["is_idle"]))
            total_focus += snap["focus_score"]
            online += 1
            key = st["label"]
            if key in counts:
                counts[key] += 1
            ts = snap["timestamp"]
            try:
                dt = datetime.strptime(str(ts)[:19], "%Y-%m-%d %H:%M:%S")
                diff = datetime.now() - dt
                last_updated = f"{int(diff.total_seconds())}s ago" if diff.total_seconds() < 60 else f"{int(diff.total_seconds()//60)} mins ago"
            except Exception:
                last_updated = "recently"
            employees_out.append({
                "emp_id": emp["emp_id"], "emp_code": emp["emp_code"], "name": emp["name"] or emp["emp_code"],
                "current_app": snap["app"], "current_title": snap["title"], "focus_score": snap["focus_score"],
                "focus_bar": _focus_bar(snap["focus_score"]), "context_switches": snap["context_switches"],
                "session_minutes": snap["session_minutes"], "status": st["label"], "status_color": st["color"],
                "status_emoji": st["emoji"], "last_updated": last_updated,
            })
        else:
            employees_out.append({
                "emp_id": emp["emp_id"], "emp_code": emp["emp_code"], "name": emp["name"] or emp["emp_code"],
                "current_app": "--", "current_title": "--", "focus_score": 0, "focus_bar": "░░░░░",
                "context_switches": 0, "session_minutes": 0, "status": "Offline", "status_color": "gray",
                "status_emoji": "⚪", "last_updated": None,
            })
    conn.close()
    team_score = round(total_focus / max(online, 1))
    logger.info(f"[WorkSense] Dashboard fetched · {online} online")
    return {
        "org_name": org_name, "total_online": online, "team_score": team_score,
        "employees": employees_out,
        "summary": {"deep_focus_count": counts["deep_focus"], "focused_count": counts["focused"], "distracted_count": counts["distracted"], "off_task_count": counts["off_task"], "idle_count": counts["idle"]},
    }


# ─── Reports ──────────────────────────────────────────────────────────────
@app.get("/manager/report/hourly")
async def report_hourly(authorization: str = Header(None)):
    p = _extract_mgr(authorization)
    since = (datetime.now() - timedelta(hours=1)).isoformat()
    conn = _get_conn()
    rows = conn.execute(
        "SELECT es.*, e.emp_code, e.name FROM employee_snapshots es JOIN employees e ON es.emp_id = e.emp_id WHERE es.org_id = ? AND es.timestamp >= ?",
        (p["org_id"], since),
    ).fetchall()
    conn.close()
    if not rows:
        return {"period": "Last 60 minutes", "team_score": 0, "strong_performers": [], "needs_attention": [], "top_project": "N/A", "recommendation": "No data in the last hour."}
    by_emp = defaultdict(lambda: {"name": "", "scores": [], "apps": []})
    for r in rows:
        r = dict(r)
        by_emp[r["emp_id"]]["name"] = r["name"] or r["emp_code"]
        by_emp[r["emp_id"]]["scores"].append(r["focus_score"])
        by_emp[r["emp_id"]]["apps"].append(r["app"] or "Unknown")
    strong = []
    attention = []
    all_apps = []
    total = 0
    for eid, ed in by_emp.items():
        avg = sum(ed["scores"]) / len(ed["scores"])
        total += avg
        all_apps.extend(ed["apps"])
        ent = {"name": ed["name"], "focus_score": round(avg), "current_task": ed["apps"][0] if ed["apps"] else ""}
        if avg >= 75:
            strong.append(ent)
        elif avg < 50:
            attention.append({**ent, "reason": "Low focus"})
    top = Counter(all_apps).most_common(1)
    return {
        "period": "Last 60 minutes",
        "team_score": round(total / max(len(by_emp), 1)),
        "strong_performers": strong,
        "needs_attention": attention,
        "top_project": top[0][0] if top else "N/A",
        "recommendation": "Team performing well." if total / max(len(by_emp), 1) >= 70 else "Consider check-in.",
    }


@app.get("/manager/report/daily")
async def report_daily(authorization: str = Header(None)):
    p = _extract_mgr(authorization)
    today = datetime.now().strftime("%Y-%m-%d")
    conn = _get_conn()
    rows = conn.execute(
        "SELECT es.*, e.emp_code, e.name FROM employee_snapshots es JOIN employees e ON es.emp_id = e.emp_id WHERE es.org_id = ? AND date(es.timestamp) = ?",
        (p["org_id"], today),
    ).fetchall()
    conn.close()
    if not rows:
        return {"date": today, "team_overview": {}, "top_performers": [], "needs_attention": [], "project_time": {}, "recommendation": "No data today."}
    by_emp = defaultdict(lambda: {"name": "", "scores": [], "minutes": 0})
    app_min = defaultdict(float)
    for r in rows:
        r = dict(r)
        by_emp[r["emp_id"]]["name"] = r["name"] or r["emp_code"]
        by_emp[r["emp_id"]]["scores"].append(r["focus_score"])
        by_emp[r["emp_id"]]["minutes"] += r["session_minutes"] or 0
        app_min[r["app"] or "Unknown"] += r["session_minutes"] or 0
    top_p = sorted([{"name": ed["name"], "avg_focus": round(sum(ed["scores"])/len(ed["scores"])), "minutes": ed["minutes"]} for ed in by_emp.values()], key=lambda x: x["avg_focus"], reverse=True)[:3]
    need = sorted([{"name": ed["name"], "avg_focus": round(sum(ed["scores"])/len(ed["scores"]))} for ed in by_emp.values()], key=lambda x: x["avg_focus"])[:2]
    avg_focus = sum(sum(ed["scores"]) for ed in by_emp.values()) / max(sum(len(ed["scores"]) for ed in by_emp.values()), 1)
    total_hrs = sum(ed["minutes"] for ed in by_emp.values()) / 60
    return {
        "date": today,
        "team_overview": {"avg_focus_score": round(avg_focus), "total_cognitive_hours": round(total_hrs, 1), "deep_focus_sessions": len(rows), "total_context_switches": sum(r.get("context_switches", 0) for r in rows), "most_productive_hour": "10am", "least_productive_hour": "3pm"},
        "top_performers": top_p,
        "needs_attention": need,
        "project_time": dict(app_min),
        "recommendation": "Strong day." if avg_focus >= 75 else "Review workflow.",
    }


@app.get("/manager/report/weekly")
async def report_weekly(authorization: str = Header(None)):
    p = _extract_mgr(authorization)
    since = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    conn = _get_conn()
    rows = conn.execute(
        "SELECT es.*, e.emp_code, e.name FROM employee_snapshots es JOIN employees e ON es.emp_id = e.emp_id WHERE es.org_id = ? AND es.timestamp >= ?",
        (p["org_id"], since),
    ).fetchall()
    conn.close()
    if not rows:
        return {"week": "Last 7 days", "executive_summary": {}, "wow_improvement": {}, "top_projects": [], "team_health": []}
    by_emp = defaultdict(lambda: {"name": "", "scores": [], "minutes": 0})
    apps = Counter()
    for r in rows:
        r = dict(r)
        by_emp[r["emp_id"]]["name"] = r["name"] or r["emp_code"]
        by_emp[r["emp_id"]]["scores"].append(r["focus_score"])
        by_emp[r["emp_id"]]["minutes"] += r["session_minutes"] or 0
        apps[r["app"] or "Unknown"] += r["session_minutes"] or 0
    team_avg = sum(sum(ed["scores"]) for ed in by_emp.values()) / max(sum(len(ed["scores"]) for ed in by_emp.values()), 1)
    health = [{"name": ed["name"], "status": "improving" if sum(ed["scores"])/len(ed["scores"]) >= 75 else "watch", "note": ""} for ed in by_emp.values()]
    return {
        "week": f"Mar {datetime.now().day-7}-{datetime.now().day} {datetime.now().year}",
        "executive_summary": {"team_size": len(by_emp), "total_cognitive_hours": round(sum(ed["minutes"] for ed in by_emp.values())/60, 1), "deep_focus_rate_pct": 40, "avg_focus_score": round(team_avg), "context_switch_rate": 12},
        "wow_improvement": {"focus_score_change": "+8 points", "deep_sessions_change": "+28%", "idle_time_change": "-38%"},
        "top_projects": [{"app": a, "minutes": m} for a, m in apps.most_common(5)],
        "team_health": health,
    }


@app.get("/manager/productivity-matrix")
async def productivity_matrix(authorization: str = Header(None)):
    p = _extract_mgr(authorization)
    conn = _get_conn()
    emps = conn.execute("SELECT emp_id, emp_code, name FROM employees WHERE org_id = ?", (p["org_id"],)).fetchall()
    result = []
    for emp in emps:
        rows = conn.execute(
            "SELECT focus_score, context_switches, session_minutes, is_idle FROM employee_snapshots WHERE emp_id = ? AND timestamp >= datetime('now','-7 days')",
            (emp["emp_id"],),
        ).fetchall()
        if not rows:
            result.append({"emp_code": emp["emp_code"], "name": emp["name"] or emp["emp_code"], "productivity_score": 0, "score_class": "red", "improvement_tip": "No data yet.", "metrics": {}})
            continue
        rows = [dict(r) for r in rows]
        avg_f = sum(r["focus_score"] for r in rows) / len(rows)
        avg_s = sum(r["context_switches"] for r in rows) / len(rows)
        avg_m = sum(r["session_minutes"] for r in rows) / len(rows)
        idle_pct = sum(1 for r in rows if r["is_idle"]) / len(rows) * 100
        score = avg_f - min(avg_s * 2, 30) + min(avg_m / 5, 20) - idle_pct * 0.5
        score = max(0, min(100, score))
        result.append({
            "emp_code": emp["emp_code"], "name": emp["name"] or emp["emp_code"],
            "productivity_score": round(score), "score_class": "green" if score >= 75 else "yellow" if score >= 50 else "red",
            "improvement_tip": get_improvement_tip(avg_f, avg_s, avg_m, idle_pct),
            "metrics": {"avg_focus_score": round(avg_f, 1), "avg_context_switches": round(avg_s, 1), "avg_session_minutes": round(avg_m, 1), "idle_percentage": round(idle_pct, 1)},
        })
    conn.close()
    result.sort(key=lambda x: x["productivity_score"], reverse=True)
    team_avg = round(sum(r["productivity_score"] for r in result) / max(len(result), 1))
    return {"employees": result, "team_average": team_avg, "generated_at": datetime.now().isoformat()}


@app.get("/manager/focus-intelligence")
async def focus_intelligence(authorization: str = Header(None), period: str = "today"):
    p = _extract_mgr(authorization)
    since = datetime.now().strftime("%Y-%m-%d") if period == "today" else (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d") if period == "week" else (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    conn = _get_conn()
    rows = conn.execute(
        "SELECT es.*, e.emp_code, e.name FROM employee_snapshots es JOIN employees e ON es.emp_id = e.emp_id WHERE es.org_id = ? AND es.timestamp >= ?",
        (p["org_id"], since),
    ).fetchall()
    conn.close()
    if not rows:
        return {"plan": "worksense", "org_avg_score": 0, "top_performers": [], "needs_attention": [], "all_employees": [], "period": period}
    by_emp = defaultdict(lambda: {"name": "", "scores": []})
    for r in rows:
        r = dict(r)
        by_emp[r["emp_id"]]["name"] = r["name"] or r["emp_code"]
        by_emp[r["emp_id"]]["scores"].append(r["focus_score"])
    all_emp = [{"name": ed["name"], "avg_focus_score": round(sum(ed["scores"])/len(ed["scores"])), "peak_focus_window": "10am-12pm", "productive_pct": 74, "unproductive_pct": 26, "recommendation": "Maintain focus."} for ed in by_emp.values()]
    all_emp.sort(key=lambda x: x["avg_focus_score"], reverse=True)
    return {"plan": "worksense", "org_avg_score": round(sum(e["avg_focus_score"] for e in all_emp)/max(len(all_emp), 1)), "top_performers": all_emp[:3], "needs_attention": all_emp[-3:], "all_employees": all_emp, "period": period}


# ─── System ───────────────────────────────────────────────────────────────
@app.get("/system/power-report")
async def system_power_report():
    cpu_count = psutil.cpu_count() or 1
    processes = []
    for proc in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent"]):
        try:
            info = proc.info
            name = info.get("name") or ""
            if name in HIDDEN_PROCESSES:
                continue
            cpu = info.get("cpu_percent") or 0
            mem = info.get("memory_percent") or 0
            cpu_norm = cpu / cpu_count
            if cpu_norm < 0.1:
                continue
            power = cpu_norm * 0.7 + mem * 0.3
            processes.append({"pid": info["pid"], "name": name, "cpu_percent": round(cpu, 1), "memory_percent": round(mem, 1), "cpu_normalized": round(cpu_norm, 2), "power_score": round(power, 2), "killable": name not in PROTECTED_PROCESSES})
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    processes.sort(key=lambda x: x["power_score"], reverse=True)
    cpu_total = psutil.cpu_percent()
    mem = psutil.virtual_memory()
    bat = None
    try:
        b = psutil.sensors_battery()
        bat = {"percent": b.percent, "plugged": b.power_plugged} if b else None
    except Exception:
        pass
    return {"processes": processes[:15], "total_cpu": cpu_total, "total_memory": mem.percent, "battery": bat}


@app.post("/system/kill-process")
async def kill_process(body: KillProcessBody):
    try:
        proc = psutil.Process(body.pid)
        name = proc.name()
        if name in PROTECTED_PROCESSES:
            raise HTTPException(status_code=403, detail="Protected process")
        proc.terminate()
        return {"status": "terminated", "pid": body.pid, "name": name}
    except psutil.NoSuchProcess:
        return {"status": "already_gone", "pid": body.pid}
    except psutil.AccessDenied:
        raise HTTPException(status_code=403, detail="Run COS as administrator")


# ─── Guardian ─────────────────────────────────────────────────────────────
@app.post("/guardian/switch")
async def guardian_switch(request: Request):
    data = await request.json()
    _switch_queue.append(data)
    if len(_switch_queue) > 10:
        _switch_queue.pop(0)
    for ws in _guardian_ws[:]:
        try:
            await ws.send_text(json.dumps({"type": "app_switch", **data}))
        except Exception:
            pass
    return {"status": "broadcast"}


# ── DRIFT INTERVENTION ENDPOINTS ────────────────────────────────────────

@app.post("/intervention/drift_v2")
async def intervention_drift(request: Request):
    """
    Called by core_daemon when drift is detected.
    Stores the intervention event and broadcasts to frontend.
    """
    global _current_intervention, _intervention_websockets
    try:
        data = await request.json()
    except Exception as e:
        print(f"[Intervention] JSON Error: {e}")
        return {"status": "error", "message": "Invalid JSON"}

    from_app       = data.get("from_app", "Unknown")
    from_title     = data.get("from_title", "")
    focus_score    = data.get("focus_score", 0)
    session_mins   = data.get("session_minutes", 0)
    to_app         = data.get("to_app", "Unknown")
    emp_id         = data.get("emp_id", "local")
    org_id         = data.get("org_id", "local")

    # Store in memory for polling
    _current_intervention = {
        "active":          True,
        "from_app":        from_app,
        "from_title":      from_title,
        "focus_score":     focus_score,
        "session_minutes": session_mins,
        "to_app":          to_app,
        "timestamp":       datetime.now().isoformat(),
        "user_returned":   None    # None = not yet answered
    }

    # Persist to DB
    try:
        drift_db_conn = _get_conn()
        drift_db_conn.execute("""
            INSERT INTO intervention_events
                (emp_id, org_id, from_app, from_title,
                 focus_score, session_minutes, to_app)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (emp_id, org_id, from_app, from_title,
              focus_score, session_mins, to_app))
        drift_db_conn.commit()
        drift_db_conn.close()
    except Exception as db_err:
        print(f"[Intervention] DB Error: {db_err}")

    # Broadcast to all frontend WebSocket connections
    dead = set()
    print(f"[Intervention] Broadcasting to {len(_intervention_websockets)} clients...")
    for ws in list(_intervention_websockets):  # Use list() to avoid size change issues
        try:
            await ws.send_json({
                "type": "intervention",
                **_current_intervention
            })
            print(f"[Intervention] Sent to client {id(ws)}")
        except Exception as ws_err:
            print(f"[Intervention] WS Broadcast Error for {id(ws)}: {ws_err}")
            dead.add(ws)
    
    if dead:
        _intervention_websockets -= dead
        print(f"[Intervention] Removed {len(dead)} dead clients")

    print(f"[Intervention] Drift: {from_app} → {to_app} "
          f"· focus:{focus_score} · {session_mins}min")
    return {"status": "intervention_active",
            "intervention": _current_intervention}


@app.get("/intervention/status")
async def intervention_status():
    """
    Polled by frontend every second.
    Returns current intervention state.
    """
    if _current_intervention and _current_intervention.get("active"):
        return _current_intervention
    return {"active": False}


@app.post("/intervention/respond")
async def intervention_respond(request: Request):
    """
    Called when user responds yes/no (voice or button).
    "yes" → clears intervention + signals reopen
    "no"  → clears intervention
    """
    global _current_intervention, _intervention_websockets
    data     = await request.json()
    response = data.get("response", "no")   # "yes" | "no"

    if _current_intervention:
        _current_intervention["active"]       = False
        _current_intervention["user_returned"] = (response == "yes")

    # Broadcast cleared state to frontend
    dead = set()
    for ws in _intervention_websockets:
        try:
            await ws.send_json({
                "type":          "intervention_cleared",
                "user_returned": (response == "yes"),
                "response":       response
            })
        except Exception:
            dead.add(ws)
    _intervention_websockets -= dead

    print(f"[Intervention] Response: {response}")
    return {"status": "cleared", "response": response}


@app.post("/intervention/reopen")
async def intervention_reopen(request: Request):
    """
    Called when user says yes — signals daemon to reopen previous app.
    Daemon polls this every second.
    """
    global _current_intervention
    app_to_reopen  = ""
    if _current_intervention:
        app_to_reopen = _current_intervention.get("from_app", "")
        _current_intervention["active"] = False

    print(f"[Intervention] Reopen: {app_to_reopen}")
    return {"status": "reopen", "app": app_to_reopen}


@app.websocket("/intervention/ws")
async def intervention_ws(websocket: WebSocket):
    """
    Frontend connects here for real-time intervention events.
    Faster than polling — fires instantly on drift detection.
    """
    global _intervention_websockets
    await websocket.accept()
    _intervention_websockets.add(websocket)
    print(f"[Intervention] WS connected · "
          f"{len(_intervention_websockets)} clients")
    try:
        # Send current state immediately on connect
        if _current_intervention and _current_intervention.get("active"):
            await websocket.send_json({
                "type": "intervention",
                **_current_intervention
            })
        while True:
            await asyncio.sleep(5)
            await websocket.send_json({"type": "ping"})
    except Exception:
        _intervention_websockets.discard(websocket)
        print("[Intervention] WS disconnected")


@app.get("/guardian/latest")
async def guardian_latest():
    return {"event": _guardian_events[-1] if _guardian_events else None}


# ─── WebSockets ──────────────────────────────────────────────────────────
@app.websocket("/manager/live/{token}")
async def manager_live_ws(websocket: WebSocket, token: str):
    p = _decode_token(token)
    if p.get("role") != "manager":
        await websocket.close(code=4003)
        return
    org_id = p["org_id"]
    await websocket.accept()
    if org_id not in _manager_ws:
        _manager_ws[org_id] = []
    _manager_ws[org_id].append(websocket)
    logger.info("[WorkSense] Manager connected · live feed active")
    try:
        while True:
            await asyncio.sleep(5)
            await websocket.send_text(json.dumps({"type": "ping"}))
    except WebSocketDisconnect:
        pass
    finally:
        _manager_ws[org_id] = [w for w in _manager_ws.get(org_id, []) if w != websocket]


@app.websocket("/guardian/ws")
async def guardian_ws(websocket: WebSocket):
    await websocket.accept()
    _guardian_ws.append(websocket)
    try:
        while True:
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        pass
    finally:
        _guardian_ws[:] = [w for w in _guardian_ws if w != websocket]


# ─── Storage & Misc ───────────────────────────────────────────────────────
@app.get("/storage/status")
async def storage_status():
    conn = _get_conn()
    total = conn.execute("SELECT COUNT(*) as c FROM employee_snapshots").fetchone()["c"]
    conn.close()
    return {"plan": "worksense", "paywall_triggered": False, "total_memories": total, "message": "Unlimited storage"}


@app.get("/recall")
async def recall(query: str = "", k: int = 5):
    from database import get_all_memories
    rows = get_all_memories()
    # Simple text match for standalone (no FAISS)
    if not query or not rows:
        return {"query": query or "", "results": rows[:k]}
    q = query.lower()
    scored = [(r, sum(1 for w in q.split() if w in (r.get("summary") or "").lower() or w in (r.get("title") or "").lower())) for r in rows]
    scored.sort(key=lambda x: -x[1])
    return {"query": query, "results": [r for r, _ in scored[:k]]}


@app.get("/timeline")
async def get_timeline():
    from database import get_all_memories
    try:
        rows = get_all_memories()
    except Exception:
        rows = []
    now = datetime.now()
    today = now.date()
    yesterday = today - timedelta(days=1)
    buckets = {"today": [], "yesterday": [], "last_week": [], "last_month": [], "last_2mo": [], "last_6mo": []}
    for r in rows:
        if not isinstance(r, dict):
            r = dict(r)
        ts_str = r.get("timestamp") or ""
        ts = now
        for fmt in ["%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d"]:
            try:
                ts = datetime.strptime(str(ts_str)[:26], fmt)
                break
            except Exception:
                continue
        days = (now - ts).days
        if ts.date() == today:
            buckets["today"].append(r)
        elif ts.date() == yesterday:
            buckets["yesterday"].append(r)
        elif days <= 7:
            buckets["last_week"].append(r)
        elif days <= 30:
            buckets["last_month"].append(r)
        elif days <= 60:
            buckets["last_2mo"].append(r)
        elif days <= 180:
            buckets["last_6mo"].append(r)
    return buckets


@app.post("/memory")
async def memory(request: Request):
    from database import insert_memory
    data = await request.json()
    mid = str(uuid.uuid4())
    ts = data.get("timestamp") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    summary = (data.get("text") or "")[:500]
    insert_memory(mid, ts, data.get("app", ""), data.get("title", ""), summary, data.get("url"))
    return {"status": "stored", "memory_id": mid}


if __name__ == "__main__":
    import uvicorn
    print("COS WorkSense Backend starting on http://localhost:8004")
    uvicorn.run(app, host="0.0.0.0", port=8004)
