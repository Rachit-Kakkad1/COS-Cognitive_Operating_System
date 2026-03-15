"""
NEWCOS — COS WorkSense API.

Manager dashboard, employee monitoring, tab guardian, and live WebSocket feed.
All endpoints prefixed with /worksense.
"""

import os
import uuid
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Header, HTTPException, Request, Query
from pydantic import BaseModel

import bcrypt
from jose import jwt, JWTError

# ── Config ────────────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("COS_JWT_SECRET", "cos-worksense-secret-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

logger = logging.getLogger(__name__)

# ── Database helper ───────────────────────────────────────────────────────
import sqlite3

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.path.join(DATA_DIR, "newcos.db")


def _get_conn() -> sqlite3.Connection:
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ── Active WebSocket connections ──────────────────────────────────────────
_manager_ws_connections: dict[str, list[WebSocket]] = {}  # org_id -> [ws]

# ── Focus Score Engine ────────────────────────────────────────────────────

DISTRACTION_APPS = [
    "youtube", "instagram", "facebook",
    "twitter", "netflix", "tiktok", "reddit",
]
PRODUCTIVE_APPS = [
    "vscode", "pycharm", "figma", "notion",
    "excel", "word", "terminal", "github",
]


def calculate_focus_score(
    context_switches: int,
    session_minutes: int,
    is_idle: bool,
    app: str,
) -> int:
    """
    Score 0-100 based on:
    - Session length (longer = higher)
    - Context switches (more = lower)
    - Idle detection (idle = very low)
    - App type (productive apps = bonus)
    """
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


def get_status(focus_score: int, switches: int, is_idle: bool) -> dict:
    if is_idle:
        return {"label": "Idle", "color": "red", "emoji": "🔴"}
    if focus_score >= 85 and switches <= 3:
        return {"label": "Deep focus", "color": "green", "emoji": "🟢"}
    if focus_score >= 70 and switches <= 7:
        return {"label": "Focused", "color": "green", "emoji": "🟢"}
    if focus_score >= 50 and switches <= 15:
        return {"label": "Distracted", "color": "yellow", "emoji": "🟡"}
    return {"label": "Off task", "color": "red", "emoji": "🔴"}


def _focus_bar(score: int) -> str:
    filled = round(score / 20)
    return "█" * filled + "░" * (5 - filled)


# ── JWT Helpers ───────────────────────────────────────────────────────────

def _create_token(payload: dict) -> str:
    payload["exp"] = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return {}


def create_access_token(payload: dict) -> str:
    """Encode a JWT with exp; used for role/personal tokens."""
    return _create_token(dict(payload))


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def _extract_token(authorization: str) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    return _decode_token(authorization.split(" ", 1)[1])


# ── Pydantic Models ──────────────────────────────────────────────────────

class OrgCreateRequest(BaseModel):
    org_name: str
    manager_email: str
    manager_password: str
    team_size: int = 5


class ManagerAuthRequest(BaseModel):
    manager_email: str
    manager_password: str


class EmployeeAuthRequest(BaseModel):
    emp_code: str
    temp_password: str


class SnapshotRequest(BaseModel):
    app: str
    title: str
    focus_score: Optional[int] = None
    context_switches: int = 0
    session_minutes: int = 0
    is_idle: bool = False


class TabSwitchRequest(BaseModel):
    from_app: str
    from_title: str
    from_focus_score: int = 0
    from_session_minutes: int = 0
    to_app: str
    to_title: str


class TabSwitchReturnedRequest(BaseModel):
    switch_id: int
    returned: bool = False


# ── Router ────────────────────────────────────────────────────────────────

worksense_router = APIRouter(prefix="/worksense", tags=["worksense"])


# ══════════════════════════════════════════════════════════════════════════
#  ORG MANAGEMENT
# ══════════════════════════════════════════════════════════════════════════

@worksense_router.post("/org/create")
async def create_org(req: OrgCreateRequest):
    """Create org + generate employee credentials."""
    org_id = str(uuid.uuid4())
    # Generate org_code: first 4 letters uppercase + year
    prefix = req.org_name.replace(" ", "")[:4].upper()
    org_code = f"{prefix}-2026"

    # Hash manager password
    mgr_hash = bcrypt.hashpw(req.manager_password.encode(), bcrypt.gensalt()).decode()

    conn = _get_conn()
    try:
        conn.execute(
            "INSERT INTO organizations (org_id, org_name, org_code, manager_email, manager_password_hash) VALUES (?, ?, ?, ?, ?)",
            (org_id, req.org_name, org_code, req.manager_email, mgr_hash),
        )
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Org code {org_code} already exists")

    # Generate employees
    employees = []
    for i in range(1, req.team_size + 1):
        emp_id = str(uuid.uuid4())
        emp_code = f"EMP{i:03d}-{org_code}"
        temp_password = uuid.uuid4().hex[:12]
        pwd_hash = bcrypt.hashpw(temp_password.encode(), bcrypt.gensalt()).decode()

        conn.execute(
            "INSERT INTO employees (emp_id, org_id, emp_code, temp_password_hash, name) VALUES (?, ?, ?, ?, ?)",
            (emp_id, org_id, emp_code, pwd_hash, f"Employee {i}"),
        )
        employees.append({
            "emp_id": emp_id,
            "emp_code": emp_code,
            "temp_password": temp_password,
        })

    conn.commit()
    conn.close()

    manager_token = _create_token({"role": "manager", "org_id": org_id, "email": req.manager_email})

    print(f"[WorkSense] Org created: {req.org_name} · {req.team_size} employees")
    return {
        "org_id": org_id,
        "org_code": org_code,
        "manager_token": manager_token,
        "employees": employees,
    }


@worksense_router.post("/auth/manager")
async def auth_manager(req: ManagerAuthRequest):
    """Authenticate manager and return token."""
    conn = _get_conn()
    row = conn.execute(
        "SELECT * FROM organizations WHERE manager_email = ?", (req.manager_email,)
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    org = dict(row)
    if not bcrypt.checkpw(req.manager_password.encode(), org["manager_password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = _create_token({"role": "manager", "org_id": org["org_id"], "email": req.manager_email})
    return {"manager_token": token, "org_id": org["org_id"], "org_name": org["org_name"]}


@worksense_router.post("/auth/employee")
async def auth_employee(req: EmployeeAuthRequest):
    """Authenticate employee and return token."""
    conn = _get_conn()
    row = conn.execute(
        "SELECT e.*, o.org_name FROM employees e JOIN organizations o ON e.org_id = o.org_id WHERE e.emp_code = ?",
        (req.emp_code,),
    ).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    emp = dict(row)
    if not bcrypt.checkpw(req.temp_password.encode(), emp["temp_password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = _create_token({"role": "employee", "emp_id": emp["emp_id"], "org_id": emp["org_id"], "emp_code": emp["emp_code"]})
    return {"emp_token": token, "emp_id": emp["emp_id"], "org_id": emp["org_id"], "org_name": emp["org_name"]}


# ══════════════════════════════════════════════════════════════════════════
#  EMPLOYEE DATA INGESTION
# ══════════════════════════════════════════════════════════════════════════

async def broadcast_to_managers(org_id: str, message: dict):
    """Send a message to all connected manager WebSockets for this org."""
    import json
    connections = _manager_ws_connections.get(org_id, [])
    dead = []
    for ws in connections:
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            dead.append(ws)
    for ws in dead:
        connections.remove(ws)


@worksense_router.post("/employee/snapshot")
async def employee_snapshot(req: SnapshotRequest, authorization: str = Header(None)):
    """Store employee snapshot and broadcast to manager."""
    payload = _extract_token(authorization)
    if payload.get("role") != "employee":
        raise HTTPException(status_code=403, detail="Employee token required")

    emp_id = payload["emp_id"]
    org_id = payload["org_id"]
    emp_code = payload.get("emp_code", "")

    # Calculate focus score if not provided
    focus = req.focus_score if req.focus_score is not None else calculate_focus_score(
        req.context_switches, req.session_minutes, req.is_idle, req.app
    )

    status = get_status(focus, req.context_switches, req.is_idle)

    conn = _get_conn()
    conn.execute(
        """INSERT INTO employee_snapshots
           (emp_id, org_id, app, title, focus_score, context_switches, session_minutes, status, is_idle)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (emp_id, org_id, req.app, req.title, focus, req.context_switches, req.session_minutes, status["label"], int(req.is_idle)),
    )
    conn.commit()
    conn.close()

    print(f"[WorkSense] Snapshot: {emp_code} · {req.app} · focus:{focus}")

    # Broadcast to manager via WebSocket
    employee_data = {
        "emp_id": emp_id,
        "emp_code": emp_code,
        "current_app": req.app,
        "current_title": req.title,
        "focus_score": focus,
        "focus_bar": _focus_bar(focus),
        "context_switches": req.context_switches,
        "session_minutes": req.session_minutes,
        "status": status["label"],
        "status_color": status["color"],
        "status_emoji": status["emoji"],
        "is_idle": req.is_idle,
        "last_updated": datetime.now().isoformat(),
    }
    await broadcast_to_managers(org_id, {
        "type": "snapshot_update",
        "employee": employee_data,
    })

    return {"status": "stored", "focus_score": focus, "status_label": status["label"]}


@worksense_router.post("/employee/tab-switch")
async def employee_tab_switch(req: TabSwitchRequest, authorization: str = Header(None)):
    """Record a tab switch and return guardian data."""
    payload = _extract_token(authorization)
    if payload.get("role") != "employee":
        raise HTTPException(status_code=403, detail="Employee token required")

    emp_id = payload["emp_id"]
    emp_code = payload.get("emp_code", "")

    conn = _get_conn()
    cursor = conn.execute(
        """INSERT INTO tab_switches
           (emp_id, from_app, from_title, from_focus_score, from_session_minutes, to_app, to_title, guardian_shown)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)""",
        (emp_id, req.from_app, req.from_title, req.from_focus_score, req.from_session_minutes, req.to_app, req.to_title),
    )
    switch_id = cursor.lastrowid
    conn.commit()
    conn.close()

    print(f"[WorkSense] Tab switch: {emp_code} · {req.from_app} → {req.to_app}")

    return {
        "should_show_guardian": True,
        "switch_id": switch_id,
        "guardian_message": f"You were working on {req.from_title} in {req.from_app}",
        "previous_context": {
            "app": req.from_app,
            "title": req.from_title,
            "focus_score": req.from_focus_score,
            "session_minutes": req.from_session_minutes,
        },
    }


@worksense_router.post("/employee/tab-switch/returned")
async def employee_tab_switch_returned(req: TabSwitchReturnedRequest, authorization: str = Header(None)):
    """Update tab switch record with whether user returned."""
    payload = _extract_token(authorization)
    if payload.get("role") != "employee":
        raise HTTPException(status_code=403, detail="Employee token required")

    conn = _get_conn()
    conn.execute(
        "UPDATE tab_switches SET user_returned = ? WHERE id = ?",
        (int(req.returned), req.switch_id),
    )
    # Get the original switch data for resume info
    row = conn.execute(
        "SELECT * FROM tab_switches WHERE id = ?", (req.switch_id,)
    ).fetchone()
    conn.commit()
    conn.close()

    if not row:
        return {"resume_app": None, "resume_title": None, "resume_url": None}

    switch = dict(row)
    return {
        "resume_app": switch["from_app"],
        "resume_title": switch["from_title"],
        "resume_url": None,
    }


# ══════════════════════════════════════════════════════════════════════════
#  MANAGER DASHBOARD
# ══════════════════════════════════════════════════════════════════════════

@worksense_router.get("/manager/dashboard")
async def manager_dashboard(authorization: str = Header(None)):
    """Return live state of ALL employees."""
    payload = _extract_token(authorization)
    if payload.get("role") != "manager":
        raise HTTPException(status_code=403, detail="Manager token required")

    org_id = payload["org_id"]

    conn = _get_conn()

    # Get org info
    org_row = conn.execute("SELECT * FROM organizations WHERE org_id = ?", (org_id,)).fetchone()
    org = dict(org_row) if org_row else {}

    # Get all employees for this org
    emp_rows = conn.execute("SELECT * FROM employees WHERE org_id = ? AND is_active = 1", (org_id,)).fetchall()

    employees_out = []
    total_focus = 0
    status_counts = {"deep_focus": 0, "focused": 0, "distracted": 0, "off_task": 0, "idle": 0}
    online_count = 0

    for emp_row in emp_rows:
        emp = dict(emp_row)
        # Get latest snapshot for this employee
        snap_row = conn.execute(
            "SELECT * FROM employee_snapshots WHERE emp_id = ? ORDER BY timestamp DESC LIMIT 1",
            (emp["emp_id"],),
        ).fetchone()

        if snap_row:
            snap = dict(snap_row)
            focus = snap["focus_score"]
            switches = snap["context_switches"]
            is_idle = bool(snap["is_idle"])
            status = get_status(focus, switches, is_idle)
            session_min = snap["session_minutes"]

            # Format session time
            if session_min >= 60:
                session_str = f"{session_min // 60}h {session_min % 60}m"
            elif session_min > 0:
                session_str = f"{session_min}m"
            else:
                session_str = "--"

            # Count switch level
            if switches <= 3:
                switch_label = "Low"
            elif switches <= 7:
                switch_label = "Norm"
            elif switches <= 15:
                switch_label = "High"
            else:
                switch_label = "VHi"

            total_focus += focus
            online_count += 1

            # Count status
            status_key = status["label"].lower().replace(" ", "_")
            if status_key in status_counts:
                status_counts[status_key] += 1

            employees_out.append({
                "emp_id": emp["emp_id"],
                "emp_code": emp["emp_code"],
                "name": emp["name"] or emp["emp_code"],
                "current_app": snap["app"],
                "current_title": snap["title"],
                "focus_score": focus,
                "focus_bar": _focus_bar(focus),
                "context_switches": switches,
                "switch_label": switch_label,
                "session_minutes": session_min,
                "session_str": session_str,
                "status": status["label"],
                "status_color": status["color"],
                "status_emoji": status["emoji"],
                "is_idle": is_idle,
                "last_updated": str(snap["timestamp"]),
            })
        else:
            # No snapshots yet — employee offline
            employees_out.append({
                "emp_id": emp["emp_id"],
                "emp_code": emp["emp_code"],
                "name": emp["name"] or emp["emp_code"],
                "current_app": "--",
                "current_title": "--",
                "focus_score": 0,
                "focus_bar": "░░░░░",
                "context_switches": 0,
                "switch_label": "--",
                "session_minutes": 0,
                "session_str": "--",
                "status": "Offline",
                "status_color": "gray",
                "status_emoji": "⚪",
                "is_idle": False,
                "last_updated": None,
            })

    conn.close()

    team_score = round(total_focus / max(online_count, 1))
    total_emp = len(employees_out)

    return {
        "org_name": org.get("org_name", "Unknown"),
        "total_online": online_count,
        "total_employees": total_emp,
        "team_score": team_score,
        "employees": employees_out,
        "summary": {
            "deep_focus_count": status_counts["deep_focus"],
            "focused_count": status_counts["focused"],
            "distracted_count": status_counts["distracted"],
            "off_task_count": status_counts["off_task"],
            "idle_count": status_counts["idle"],
        },
    }


# ── REPORTS ───────────────────────────────────────────────────────────────

@worksense_router.get("/manager/report/hourly")
async def manager_report_hourly(authorization: str = Header(None)):
    """Hourly summary from last 60 minutes of snapshots."""
    payload = _extract_token(authorization)
    if payload.get("role") != "manager":
        raise HTTPException(status_code=403, detail="Manager token required")

    org_id = payload["org_id"]
    one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()

    conn = _get_conn()
    rows = conn.execute(
        """SELECT es.*, e.emp_code, e.name FROM employee_snapshots es
           JOIN employees e ON es.emp_id = e.emp_id
           WHERE es.org_id = ? AND es.timestamp >= ?
           ORDER BY es.timestamp DESC""",
        (org_id, one_hour_ago),
    ).fetchall()
    conn.close()

    if not rows:
        return {
            "period": "Last 60 minutes",
            "team_score": 0,
            "strong_performers": [],
            "needs_attention": [],
            "top_project": "N/A",
            "recommendation": "No data available for the last hour. Employees may be offline.",
        }

    snapshots = [dict(r) for r in rows]

    # Aggregate per employee
    emp_data = {}
    for s in snapshots:
        eid = s["emp_id"]
        if eid not in emp_data:
            emp_data[eid] = {"name": s["name"] or s["emp_code"], "scores": [], "apps": [], "switches": 0}
        emp_data[eid]["scores"].append(s["focus_score"])
        emp_data[eid]["apps"].append(s["app"])
        emp_data[eid]["switches"] += s["context_switches"]

    strong = []
    attention = []
    all_apps = []
    total_score = 0

    for eid, ed in emp_data.items():
        avg = round(sum(ed["scores"]) / len(ed["scores"]))
        total_score += avg
        all_apps.extend(ed["apps"])
        entry = {"name": ed["name"], "avg_focus": avg, "switches": ed["switches"]}
        if avg >= 75:
            strong.append(entry)
        elif avg < 50:
            attention.append(entry)

    team_score = round(total_score / max(len(emp_data), 1))

    # Most common app
    from collections import Counter
    top_app = Counter(all_apps).most_common(1)
    top_project = top_app[0][0] if top_app else "N/A"

    recommendation = "Team is performing well." if team_score >= 70 else \
        "Consider a team check-in — focus scores are below target." if team_score >= 50 else \
        "Attention needed — multiple team members are distracted or off-task."

    return {
        "period": "Last 60 minutes",
        "team_score": team_score,
        "strong_performers": strong,
        "needs_attention": attention,
        "top_project": top_project,
        "recommendation": recommendation,
    }


@worksense_router.get("/manager/report/daily")
async def manager_report_daily(authorization: str = Header(None)):
    """Daily report from today's snapshots."""
    payload = _extract_token(authorization)
    if payload.get("role") != "manager":
        raise HTTPException(status_code=403, detail="Manager token required")

    org_id = payload["org_id"]
    today = datetime.now().strftime("%Y-%m-%d")

    conn = _get_conn()
    rows = conn.execute(
        """SELECT es.*, e.emp_code, e.name FROM employee_snapshots es
           JOIN employees e ON es.emp_id = e.emp_id
           WHERE es.org_id = ? AND date(es.timestamp) = ?
           ORDER BY es.timestamp DESC""",
        (org_id, today),
    ).fetchall()
    conn.close()

    if not rows:
        return {
            "date": today,
            "team_overview": "No data recorded today.",
            "top_performers": [],
            "needs_attention": [],
            "project_time": {},
            "recommendation": "No snapshots recorded today — team may be offline.",
        }

    snapshots = [dict(r) for r in rows]

    emp_data = {}
    app_minutes = {}
    for s in snapshots:
        eid = s["emp_id"]
        if eid not in emp_data:
            emp_data[eid] = {"name": s["name"] or s["emp_code"], "scores": [], "total_minutes": 0}
        emp_data[eid]["scores"].append(s["focus_score"])
        emp_data[eid]["total_minutes"] += s["session_minutes"]

        app = s["app"] or "Unknown"
        app_minutes[app] = app_minutes.get(app, 0) + s["session_minutes"]

    top_performers = []
    needs_attention = []
    total_score = 0

    for eid, ed in emp_data.items():
        avg = round(sum(ed["scores"]) / len(ed["scores"]))
        total_score += avg
        entry = {"name": ed["name"], "avg_focus": avg, "total_minutes": ed["total_minutes"]}
        if avg >= 80:
            top_performers.append(entry)
        elif avg < 50:
            needs_attention.append(entry)

    team_score = round(total_score / max(len(emp_data), 1))
    team_overview = f"Team average focus: {team_score}/100 · {len(emp_data)} active employees · {len(snapshots)} snapshots recorded."

    recommendation = "Strong day — team maintained high focus." if team_score >= 75 else \
        "Average day — consider reviewing workflow blockers." if team_score >= 50 else \
        "Below target — schedule 1:1s to identify blockers and support needed."

    return {
        "date": today,
        "team_overview": team_overview,
        "top_performers": sorted(top_performers, key=lambda x: x["avg_focus"], reverse=True),
        "needs_attention": sorted(needs_attention, key=lambda x: x["avg_focus"]),
        "project_time": dict(sorted(app_minutes.items(), key=lambda x: x[1], reverse=True)),
        "recommendation": recommendation,
    }


@worksense_router.get("/manager/report/weekly")
async def manager_report_weekly(authorization: str = Header(None)):
    """Weekly report from last 7 days."""
    payload = _extract_token(authorization)
    if payload.get("role") != "manager":
        raise HTTPException(status_code=403, detail="Manager token required")

    org_id = payload["org_id"]
    week_ago = (datetime.now() - timedelta(days=7)).isoformat()

    conn = _get_conn()
    rows = conn.execute(
        """SELECT es.*, e.emp_code, e.name FROM employee_snapshots es
           JOIN employees e ON es.emp_id = e.emp_id
           WHERE es.org_id = ? AND es.timestamp >= ?
           ORDER BY es.timestamp DESC""",
        (org_id, week_ago),
    ).fetchall()
    conn.close()

    if not rows:
        return {
            "week": f"Last 7 days ending {datetime.now().strftime('%Y-%m-%d')}",
            "executive_summary": "No data recorded this week.",
            "wow_improvement": {},
            "top_projects": [],
            "team_health": [],
        }

    snapshots = [dict(r) for r in rows]
    from collections import Counter

    # Aggregate
    emp_data = {}
    app_counter = Counter()
    for s in snapshots:
        eid = s["emp_id"]
        if eid not in emp_data:
            emp_data[eid] = {"name": s["name"] or s["emp_code"], "scores": [], "minutes": 0}
        emp_data[eid]["scores"].append(s["focus_score"])
        emp_data[eid]["minutes"] += s["session_minutes"]
        app_counter[s["app"] or "Unknown"] += s["session_minutes"]

    total = sum(sum(ed["scores"]) / len(ed["scores"]) for ed in emp_data.values())
    team_avg = round(total / max(len(emp_data), 1))

    team_health = []
    for eid, ed in emp_data.items():
        avg = round(sum(ed["scores"]) / len(ed["scores"]))
        team_health.append({
            "name": ed["name"],
            "avg_focus": avg,
            "total_minutes": ed["minutes"],
            "status": "strong" if avg >= 75 else "average" if avg >= 50 else "needs_support",
        })

    top_projects = [{"app": app, "minutes": mins} for app, mins in app_counter.most_common(5)]

    return {
        "week": f"Last 7 days ending {datetime.now().strftime('%Y-%m-%d')}",
        "executive_summary": f"Team averaged {team_avg}/100 focus score across {len(emp_data)} employees with {len(snapshots)} snapshots recorded.",
        "wow_improvement": {"team_score": team_avg, "snapshots_count": len(snapshots), "active_employees": len(emp_data)},
        "top_projects": top_projects,
        "team_health": sorted(team_health, key=lambda x: x["avg_focus"], reverse=True),
    }


# ══════════════════════════════════════════════════════════════════════════
#  PRODUCTIVITY & SYSTEM ALERTS
# ══════════════════════════════════════════════════════════════════════════

@worksense_router.get("/manager/productivity-matrix")
async def productivity_matrix(
    authorization: str = Header(None)
):
    """
    Returns productivity score + improvement tip per employee.
    Score is computed from: focus_score, context_switches,
    session_minutes, idle_time from last 7 days of snapshots.
    """
    token   = authorization.replace("Bearer ", "") if authorization else ""
    payload = verify_token(token)
    if not payload or payload.get("role") != "manager":
        raise HTTPException(status_code=403, detail="Manager access required")

    org_id = payload.get("org_id")
    conn   = _get_conn()

    employees = conn.execute(
        "SELECT emp_id, emp_code, name FROM employees WHERE org_id=?",
        (org_id,)
    ).fetchall()

    result = []
    for emp in employees:
        emp_id   = emp["emp_id"]
        emp_name = emp["name"] or emp["emp_code"]

        # Get last 7 days of snapshots
        snapshots = conn.execute("""
            SELECT focus_score, context_switches,
                   session_minutes, is_idle
            FROM employee_snapshots
            WHERE emp_id=?
            AND timestamp >= datetime('now', '-7 days')
        """, (emp_id,)).fetchall()

        if not snapshots:
            result.append({
                "emp_code":          emp["emp_code"],
                "name":              emp_name,
                "productivity_score": 0,
                "score_class":       "red",
                "improvement_tip":   "No data yet — ensure COS daemon is running",
                "metrics":           {}
            })
            continue

        avg_focus    = sum(s["focus_score"]       for s in snapshots) / len(snapshots)
        avg_switches = sum(s["context_switches"]  for s in snapshots) / len(snapshots)
        avg_session  = sum(s["session_minutes"]   for s in snapshots) / len(snapshots)
        idle_pct     = sum(1 for s in snapshots if s["is_idle"]) / len(snapshots) * 100

        # Productivity score formula
        score  = avg_focus
        score -= min(avg_switches * 2, 30)
        score += min(avg_session  / 5, 20)
        score -= idle_pct * 0.5
        score  = max(0, min(100, score))

        # Score class
        score_class = (
            "green"  if score >= 75 else
            "yellow" if score >= 50 else
            "red"
        )

        # Improvement tip based on weakest metric
        if idle_pct > 20:
            tip = "High idle time detected — check for blockers or disengagement"
        elif avg_switches > 15:
            tip = "Too many context switches — try time-blocking in 90-min sessions"
        elif avg_session < 20:
            tip = "Sessions too short — encourage deeper focus blocks"
        elif avg_focus < 50:
            tip = "Low focus score — reduce notifications and distraction apps"
        else:
            tip = "Performing well — maintain current work patterns"

        result.append({
            "emp_code":           emp["emp_code"],
            "name":               emp_name,
            "productivity_score": round(score),
            "score_class":        score_class,
            "improvement_tip":    tip,
            "metrics": {
                "avg_focus_score":     round(avg_focus, 1),
                "avg_context_switches": round(avg_switches, 1),
                "avg_session_minutes":  round(avg_session, 1),
                "idle_percentage":      round(idle_pct, 1)
            }
        })

    conn.close()
    result.sort(key=lambda x: x["productivity_score"], reverse=True)
    return {"employees": result, "generated_at": datetime.now().isoformat()}


@worksense_router.post("/employee/system-alert")
async def employee_system_alert(
    request: Request,
    authorization: str = Header(None)
):
    """
    Receives CPU/power alerts from employee extension.
    Stores and broadcasts to manager dashboard.
    """
    token   = authorization.replace("Bearer ", "") if authorization else ""
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401)

    data     = await request.json()
    emp_id   = payload.get("emp_id")
    org_id   = payload.get("org_id")
    alert    = {
        "emp_id":     emp_id,
        "org_id":     org_id,
        "alert_type": data.get("alert_type"),
        "value":      data.get("value"),
        "detail":     data.get("detail"),
        "timestamp":  data.get("timestamp")
    }

    # Broadcast to manager WebSocket
    await broadcast_to_managers(org_id, {
        "type":  "system_alert",
        "alert": alert
    })

    print(f"[WorkSense] System alert: {emp_id} · {alert['alert_type']} · {alert['value']}")
    return {"status": "received"}


# ══════════════════════════════════════════════════════════════════════════
#  WEBSOCKET — LIVE FEED
# ══════════════════════════════════════════════════════════════════════════

@worksense_router.websocket("/manager/live/{manager_token}")
async def manager_live_feed(websocket: WebSocket, manager_token: str):
    """WebSocket for real-time manager dashboard updates."""
    import json

    try:
        payload = _decode_token(manager_token)
    except HTTPException:
        await websocket.close(code=4001, reason="Invalid token")
        return

    if payload.get("role") != "manager":
        await websocket.close(code=4003, reason="Manager token required")
        return

    org_id = payload["org_id"]

    await websocket.accept()
    print(f"[WorkSense] Manager connected to live feed · org:{org_id}")

    # Register this connection
    if org_id not in _manager_ws_connections:
        _manager_ws_connections[org_id] = []
    _manager_ws_connections[org_id].append(websocket)

    try:
        while True:
            # Send ping every 5 seconds to keep alive
            await asyncio.sleep(5)
            await websocket.send_text(json.dumps({"type": "ping", "timestamp": datetime.now().isoformat()}))
    except WebSocketDisconnect:
        print(f"[WorkSense] Manager disconnected from live feed · org:{org_id}")
    except Exception:
        pass
    finally:
        if websocket in _manager_ws_connections.get(org_id, []):
            _manager_ws_connections[org_id].remove(websocket)


@worksense_router.get("/report/focus-intelligence")
async def focus_intelligence_report(
    authorization: str = Header(None),
    date: str = Query(default=None)
):
    """
    Generates Focus Intelligence Report.
    Personal: own data only.
    Teams: team summary.
    WorkSense: full org with recommendations.
    """
    token   = authorization.replace("Bearer ", "") if authorization else ""
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401)

    role     = payload.get("role")      # manager or employee
    emp_id   = payload.get("emp_id")
    org_id   = payload.get("org_id")
    plan     = payload.get("plan", "personal")
    target_date = date or datetime.now().strftime("%Y-%m-%d")

    conn = _get_conn()

    def get_snapshots(eid):
        return conn.execute("""
            SELECT app, focus_score, context_switches,
                   session_minutes, is_idle, timestamp
            FROM employee_snapshots
            WHERE emp_id=?
            AND DATE(timestamp)=?
            ORDER BY timestamp ASC
        """, (eid, target_date)).fetchall()

    def build_individual_report(eid, name):
        snaps = get_snapshots(eid)
        if not snaps:
            return {"name": name, "no_data": True}

        scores      = [s["focus_score"] for s in snaps]
        switches    = [s["context_switches"] for s in snaps]
        apps        = [s["app"] for s in snaps]
        idle_count  = sum(1 for s in snaps if s["is_idle"])

        # Productive vs unproductive apps
        PRODUCTIVE   = ["code","vscode","pycharm","figma","notion",
                        "excel","word","terminal","github","docs"]
        UNPRODUCTIVE = ["youtube","instagram","facebook","twitter",
                        "netflix","tiktok","reddit","whatsapp"]

        productive_time   = sum(
            1 for s in snaps
            if any(p in (s["app"] or "").lower() for p in PRODUCTIVE)
        )
        unproductive_time = sum(
            1 for s in snaps
            if any(u in (s["app"] or "").lower() for u in UNPRODUCTIVE)
        )
        total = len(snaps)

        # Peak focus window
        peak_idx   = scores.index(max(scores))
        peak_time  = snaps[peak_idx]["timestamp"]

        # Productivity areas
        productive_pct   = round(productive_time / total * 100) if total else 0
        unproductive_pct = round(unproductive_time / total * 100) if total else 0

        # Cognitive score 0-100
        cognitive_score = round(
            sum(scores) / len(scores) -
            (sum(switches) / len(switches) * 2) -
            (idle_count / total * 20)
        )
        cognitive_score = max(0, min(100, cognitive_score))

        # Top productive apps
        from collections import Counter
        app_counts       = Counter(apps)
        top_apps         = app_counts.most_common(3)

        # Recommendations
        recs = []
        if unproductive_pct > 20:
            recs.append("Reduce time on distraction apps — consider app blockers")
        if sum(switches)/len(switches) > 10:
            recs.append("Too many context switches — try 90-min focus blocks")
        if idle_count / total > 0.2:
            recs.append("High idle time — check for blockers or fatigue")
        if productive_pct > 70:
            recs.append("Excellent focus today — maintain this pattern")
        if not recs:
            recs.append("Good balance — keep current work patterns")

        return {
            "name":              name,
            "date":              target_date,
            "cognitive_score":   cognitive_score,
            "productive_pct":    productive_pct,
            "unproductive_pct":  unproductive_pct,
            "peak_focus_time":   peak_time,
            "avg_focus_score":   round(sum(scores)/len(scores)),
            "total_switches":    sum(switches),
            "idle_pct":          round(idle_count/total*100),
            "top_apps":          [{"app":a,"count":c} for a,c in top_apps],
            "recommendations":   recs,
            "productive_area":   productive_pct,
            "unproductive_area": unproductive_pct,
        }

    # Personal plan — own report only
    if plan == "personal":
        report = build_individual_report(emp_id, "You")
        conn.close()
        return {"plan": "personal", "report": report}

    # Teams plan — own + team summary
    if plan == "teams":
        employees = conn.execute(
            "SELECT emp_id, name, emp_code FROM employees WHERE org_id=?",
            (org_id,)
        ).fetchall()
        reports = [
            build_individual_report(e["emp_id"], e["name"] or e["emp_code"])
            for e in employees
        ]
        non_empty = [r for r in reports if not r.get("no_data")]
        team_avg = round(
            sum(r["cognitive_score"] for r in non_empty) /
            max(1, len(non_empty))
        ) if non_empty else 0
        conn.close()
        return {
            "plan":       "teams",
            "team_score": team_avg,
            "reports":    reports
        }

    # WorkSense — full org with manager recommendations
    employees = conn.execute(
        "SELECT emp_id, name, emp_code FROM employees WHERE org_id=?",
        (org_id,)
    ).fetchall()
    reports = [
        build_individual_report(e["emp_id"], e["name"] or e["emp_code"])
        for e in employees
    ]
    valid = [r for r in reports if not r.get("no_data")]
    team_score = round(
        sum(r["cognitive_score"] for r in valid) / max(1, len(valid))
    ) if valid else 0
    top_performer    = max(valid, key=lambda r: r["cognitive_score"], default=None) if valid else None
    needs_attention  = min(valid, key=lambda r: r["cognitive_score"], default=None) if valid else None

    mgr_recs = []
    if team_score < 60:
        mgr_recs.append("Team focus is low — consider async work policy")
    if any(r["unproductive_pct"] > 30 for r in valid):
        mgr_recs.append("Multiple employees showing high distraction — review meeting load")
    if team_score > 80:
        mgr_recs.append("Strong team performance — protect this focus window")

    conn.close()
    return {
        "plan":                "worksense",
        "team_score":          team_score,
        "top_performer":       top_performer,
        "needs_attention":     needs_attention,
        "manager_recommendations": mgr_recs,
        "reports":             reports
    }
