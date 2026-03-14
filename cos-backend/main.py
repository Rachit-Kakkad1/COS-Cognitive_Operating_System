"""
NEWCOS — FastAPI Backend.

Endpoints:
    GET  /health                → status + version
    POST /memory                → ingest a new snapshot
    GET  /recall?query=...&k=5  → smart recall
    GET  /memories?app=..&date= → filtered memory list
    GET  /graph                 → export graph JSON
    GET  /timeline              → memories grouped by timeframe
    POST /hotkey/recall         → fired by Ctrl+Shift+R
"""

import sys
import os
import logging
from datetime import datetime, timedelta

from fastapi import FastAPI, Request, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import psutil
import subprocess
from typing import Optional

# Add cos-ai-core to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "cos-ai-core"))

from database import insert_memory, get_all_memories, get_memories_by_app, get_memories_by_date, get_memory_by_id, _get_conn
from vector_store import vector_store
from recall_engine import recall
from worksense import worksense_router, verify_token
from student import student_router

# Lazy import to avoid loading model at import time if not needed
_pipeline = None
_graph_engine = None


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        from processing_pipeline import process_snapshot
        _pipeline = process_snapshot
    return _pipeline


def _get_graph_engine():
    global _graph_engine
    if _graph_engine is None:
        import graph_engine
        _graph_engine = graph_engine
    return _graph_engine


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-20s | %(levelname)-7s | %(message)s",
)
logger = logging.getLogger(__name__)

# Global state for context switching
_last_memory = None
_switch_event = None  # Stores { "from": memory_dict, "timestamp": iso_str }

app = FastAPI(title="NEWCOS Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── WorkSense & Student APIs ────────────────────────────────────────────
app.include_router(worksense_router)
app.include_router(student_router)


# ─── Request logging middleware ──────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"[API] {request.method} {request.url.path}")
    response = await call_next(request)
    return response


# ─── Models ──────────────────────────────────────────────────────────────
class SnapshotInput(BaseModel):
    app: str
    title: str
    url: Optional[str] = None
    text: Optional[str] = ""
    timestamp: Optional[str] = None


class ReopenRequest(BaseModel):
    app: str
    title: Optional[str] = None


# ─── Endpoints ───────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "version": "NEWCOS v1.0", "memories": vector_store.count}


@app.post("/memory")
async def ingest_memory(snap: SnapshotInput):
    """Ingest a new context snapshot: embed → store in SQLite + FAISS + graph."""
    process = _get_pipeline()
    ge = _get_graph_engine()
    global _last_memory, _switch_event

    ts = snap.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M")
    snapshot = {"app": snap.app, "title": snap.title, "text": snap.text or "", "timestamp": ts}

    result = process(snapshot)

    # Detect Switch
    if _last_memory and (_last_memory["app"] != snap.app or _last_memory["title"] != snap.title):
        logger.info(f"[Switch] Detected context switch from {_last_memory['app']} to {snap.app}")
        _switch_event = {
            "from": _last_memory,
            "to": snapshot,
            "timestamp": datetime.now().isoformat()
        }

    # Store in SQLite
    insert_memory(
        memory_id=result["memory_id"],
        timestamp=ts,
        app=snap.app,
        title=snap.title,
        summary=result["summary"],
        url=snap.url,
    )
    
    # Update last memory (include URL)
    _last_memory = {
        "memory_id": result["memory_id"],
        "app": snap.app,
        "title": snap.title,
        "summary": result["summary"],
        "url": snap.url,
        "timestamp": ts
    }

    # Store in FAISS
    vector_store.add_vector(result["memory_id"], result["embedding"])

    # Add to graph
    ge.add_memory_node(result["memory_id"], result["summary"], snap.app, ts)
    ge.compute_edges(result["memory_id"], result["embedding"], vector_store.get_all_embeddings())

    return {"status": "stored", "memory_id": result["memory_id"]}


@app.get("/recall")
async def recall_endpoint(query: str, k: int = 5):
    """Smart recall: query → embed → FAISS → SQLite → ranked results."""
    return recall(query, k=k)


@app.get("/memories")
async def get_memories(app: Optional[str] = None, date: Optional[str] = None):
    """Filtered memory list by app and/or date."""
    if app:
        return get_memories_by_app(app)
    if date:
        return get_memories_by_date(date)
    return get_all_memories()


@app.get("/graph")
async def get_graph():
    """Export graph JSON for frontend visualization."""
    ge = _get_graph_engine()
    return ge.export_graph_json()


@app.get("/timeline")
async def timeline_by_period(
    period: str = Query(default="today"),
    authorization: str = Header(default=None)
):
    """
    Returns memories for a specific time period.
    Periods: today · yesterday · last_week ·
             last_month · last_2months · last_6months
    """
    PERIOD_SQL = {
        "today":        "DATE(timestamp) = DATE('now')",
        "yesterday":    "DATE(timestamp) = DATE('now','-1 day')",
        "last_week":    "timestamp >= datetime('now','-7 days')",
        "last_month":   "timestamp >= datetime('now','-30 days')"
                        " AND timestamp < datetime('now','-7 days')",
        "last_2months": "timestamp >= datetime('now','-60 days')"
                        " AND timestamp < datetime('now','-30 days')",
        "last_6months": "timestamp >= datetime('now','-180 days')"
                        " AND timestamp < datetime('now','-60 days')",
    }
    where = PERIOD_SQL.get(period, PERIOD_SQL["today"])
    conn  = _get_conn()
    rows  = conn.execute(f"""
        SELECT memory_id, title, summary, app, timestamp
        FROM memories
        WHERE {where}
        ORDER BY timestamp DESC
        LIMIT 200
    """).fetchall()
    conn.close()
    return {
        "period":   period,
        "memories": [dict(r) for r in rows],
        "count":    len(rows)
    }


@app.post("/hotkey/recall")
async def hotkey_recall():
    """Fired by Ctrl+Shift+R — returns top recall result."""
    all_memories = get_all_memories()
    if not all_memories:
        return {"result": None, "message": "No memories stored yet."}

    latest = all_memories[0]
    query = f"{latest.get('app', '')} {latest.get('title', '')}"
    result = recall(query, k=1)

    if result["results"]:
        return {"result": result["results"][0]}
    return {"result": None, "message": "No matching memory found."}


@app.post("/reopen")
async def reopen_app(req: ReopenRequest):
    """Try to find and activate a native app window."""
    try:
        import pygetwindow as gw
        
        # Try finding by exact title first
        win = None
        if req.title:
            wins = gw.getWindowsWithTitle(req.title)
            if wins:
                win = wins[0]
        
        # If not found, try by app name
        if not win:
            wins = [w for w in gw.getAllWindows() if req.app.lower() in w.title.lower()]
            if wins:
                win = wins[0]
        
        if win:
            if win.isMinimized:
                win.restore()
            win.activate()
            return {"status": "activated", "title": win.title}
        
        return {"status": "not_found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/system/power-monitor")
async def power_monitor():
    """
    Returns top power-consuming processes across entire OS.
    Works for Personal, Teams, WorkSense.
    """
    processes = []
    for proc in psutil.process_iter(
        ['pid','name','cpu_percent','memory_percent',
         'status','create_time']
    ):
        try:
            info = proc.info
            if info['cpu_percent'] is None: continue
            processes.append({
                "pid":         info['pid'],
                "name":        info['name'],
                "cpu_pct":     round(info['cpu_percent'], 1),
                "memory_pct":  round(info['memory_percent'], 1),
                "status":      info['status'],
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    # Sort by CPU usage
    processes.sort(key=lambda x: x['cpu_pct'], reverse=True)
    top = processes[:10]

    # Flag critical processes
    for p in top:
        p['critical'] = p['cpu_pct'] >= 85
        p['warning']  = 60 <= p['cpu_pct'] < 85
        p['power_level'] = (
            'critical' if p['cpu_pct'] >= 85 else
            'high'     if p['cpu_pct'] >= 60 else
            'medium'   if p['cpu_pct'] >= 30 else
            'low'
        )

    return {
        "processes":    top,
        "critical_count": sum(1 for p in top if p['critical']),
        "timestamp":    datetime.now().isoformat()
    }


@app.post("/system/kill-process")
async def kill_process(request: Request):
    """
    Kills a process by PID.
    All plans — user must confirm first.
    """
    data = await request.json()
    pid  = data.get("pid")
    if not pid:
        raise HTTPException(status_code=400, detail="PID required")
    try:
        proc = psutil.Process(pid)
        name = proc.name()
        proc.terminate()
        print(f"[TaskKiller] Terminated: {name} (PID {pid})")
        return {
            "status":  "terminated",
            "process": name,
            "pid":     pid
        }
    except psutil.NoSuchProcess:
        return {"status": "already_gone", "pid": pid}
    except psutil.AccessDenied:
        return {"status": "access_denied",
                "message": "Run COS as administrator to kill this process"}


@app.get("/system/cpu-snapshot")
async def cpu_snapshot():
    """
    Quick CPU snapshot — used to trigger alerts.
    Fires every 10 seconds from frontend polling.
    """
    cpu_total = psutil.cpu_percent(interval=0.5)
    memory    = psutil.virtual_memory()
    battery   = None
    try:
        bat     = psutil.sensors_battery()
        battery = {
            "percent":   bat.percent,
            "plugged":   bat.power_plugged,
            "secs_left": bat.secsleft
        } if bat else None
    except Exception:
        pass

    # Get top CPU process
    top_proc = max(
        psutil.process_iter(['pid','name','cpu_percent']),
        key=lambda p: p.info.get('cpu_percent') or 0,
        default=None
    )

    return {
        "cpu_total":    cpu_total,
        "memory_pct":   memory.percent,
        "battery":      battery,
        "spike":        cpu_total >= 85,
        "top_process": {
            "name":    top_proc.info['name'],
            "pid":     top_proc.info['pid'],
            "cpu_pct": top_proc.info['cpu_percent']
        } if top_proc else None
    }


@app.get("/switch_status")
async def get_switch_status():
    """Returns the latest context switch event if it happened recently (last 10s)."""
    global _switch_event
    if not _switch_event:
        return {"event": None}
    
    # Check if event is recent (within 10 seconds)
    event_ts = datetime.fromisoformat(_switch_event["timestamp"])
    if datetime.now() - event_ts > timedelta(seconds=10):
        return {"event": None}
        
    return {"event": _switch_event}


@app.get("/storage/status")
async def storage_status(
    authorization: str = Header(default=None)
):
    """
    Checks if user has hit their storage limit.
    Personal: 3 months · Teams: 6 months · WorkSense: unlimited
    """
    token   = (authorization or "").replace("Bearer ", "")
    payload = verify_token(token) if token else {}
    plan    = payload.get("plan", "personal")

    LIMITS = {
        "personal":  90,   # days
        "teams":     180,  # days
        "worksense": None  # unlimited
    }

    limit_days = LIMITS.get(plan)
    if limit_days is None:
        return { "plan": plan, "limit_reached": False,
                 "unlimited": True }

    conn     = _get_conn()
    oldest   = conn.execute("""
        SELECT MIN(timestamp) as oldest FROM memories
    """).fetchone()
    total    = conn.execute(
        "SELECT COUNT(*) as cnt FROM memories"
    ).fetchone()
    conn.close()

    if not oldest["oldest"]:
        return { "plan": plan, "limit_reached": False,
                 "days_used": 0, "limit_days": limit_days }

    from datetime import datetime
    oldest_dt  = datetime.fromisoformat(oldest["oldest"])
    days_used  = (datetime.now() - oldest_dt).days
    pct_used   = round(days_used / limit_days * 100)
    approaching = pct_used >= 80

    return {
        "plan":          plan,
        "limit_reached": days_used >= limit_days,
        "approaching":   approaching,
        "days_used":     days_used,
        "limit_days":    limit_days,
        "pct_used":      pct_used,
        "total_memories": total["cnt"],
        "message": (
            f"Storage limit reached — {days_used} days of data stored. "
            f"Upgrade to keep your memories or delete and start fresh."
            if days_used >= limit_days else
            f"{limit_days - days_used} days remaining on {plan} plan"
        )
    }

@app.delete("/storage/clear")
async def storage_clear(
    authorization: str = Header(default=None)
):
    """Deletes all memories — fresh start."""
    conn = _get_conn()
    conn.execute("DELETE FROM memories")
    conn.commit()
    conn.close()
    return { "status": "cleared",
             "message": "All memories deleted — fresh start" }

# ─── Mode API ────────────────────────────────────────────────────────────

MODE_LANGUAGE = {
  'professional': {
    'recall_prefix':  "You were working on",
    'return_prompt':  "Would you like to resume?",
    'focus_good':     "Deep focus session detected",
    'focus_bad':      "High context switching detected",
  },
  'student': {
    'recall_prefix':  "You were studying",
    'return_prompt':  "Want to get back to studying?",
    'focus_good':     "Great study session! 🎉",
    'focus_bad':      "Lots of distractions today 😅",
  },
  'child': {
    'recall_prefix':  "You were learning about",
    'return_prompt':  "Want to go back to learning? 📚",
    'focus_good':     "Amazing focus! You're a superstar! ⭐",
    'focus_bad':      "Oops! Let's get back on track! 💪",
  },
  'senior': {
    'recall_prefix':  "You were reading",
    'return_prompt':  "Would you like to go back to that?",
    'focus_good':     "You had a good session today",
    'focus_bad':      "You switched between things a few times",
  },
  'employee': {
    'recall_prefix':  "You were working on",
    'return_prompt':  "Jump back in? 💪",
    'focus_good':     "Outstanding focus — you're crushing it 🔥",
    'focus_bad':      "Multiple context switches — try time-blocking",
  },
  'parent': {
    'recall_prefix':  "Your child was on",
    'return_prompt':  "Check in?",
    'focus_good':     "Good study session",
    'focus_bad':      "High distraction detected",
  },
}

@app.get("/mode/recall")
async def mode_aware_recall(
    query:  str = "",
    mode:   str = "professional",
    k:      int = 5
):
    """
    Mode-aware recall — same engine, different language.
    Returns results with mode-specific messaging.
    """
    results = recall(query, k)
    lang    = MODE_LANGUAGE.get(mode, MODE_LANGUAGE['professional'])

    # Adapt language of results
    if isinstance(results, dict) and 'results' in results:
        for r in results.get('results', []):
            r['message'] = f"{lang['recall_prefix']} {r.get('summary','')}"
            r['cta']     = lang['return_prompt']
            
        results['mode']     = mode
        results['language'] = lang

    return results

@app.post("/mode/save")
async def save_user_mode(request: Request):
    """Saves user mode selection to SQLite."""
    data = await request.json()
    mode = data.get('mode')
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS user_settings (
            key   TEXT PRIMARY KEY,
            value TEXT
        )
    """)
    conn.execute(
        "INSERT OR REPLACE INTO user_settings VALUES (?,?)",
        ('user_mode', mode)
    )
    conn.commit()
    conn.close()
    return {"status": "saved", "mode": mode}

@app.get("/mode/coach-tip")
async def coach_tip(mode: str = "employee"):
    """
    Returns a personalized coaching tip based on
    the user's actual behavior patterns from last 7 days.
    """
    conn = _get_conn()

    # Get last 7 days of snapshots
    snapshots = conn.execute("""
        SELECT app, focus_score, context_switches,
               session_minutes, timestamp
        FROM employee_snapshots
        WHERE timestamp >= datetime('now', '-7 days')
        ORDER BY timestamp
    """).fetchall()
    conn.close()

    if not snapshots:
        tips = {
            'professional': "Start your day with your hardest task — your brain is freshest in the morning.",
            'student':      "Try the Pomodoro technique — 25 min study, 5 min break.",
            'employee':     "Block your top 2 hours for deep work — no meetings, no Slack.",
            'child':        "Great job starting! Try to study for 20 minutes without stopping! 🌟",
            'senior':       "Take it one step at a time. You're doing wonderfully.",
            'parent':       "Set consistent screen time limits — consistency is key.",
        }
        return {"tip": tips.get(mode, tips['professional']), "based_on": "default"}

    # Analyze patterns
    avg_focus    = sum(s['focus_score'] for s in snapshots) / len(snapshots)
    avg_switches = sum(s['context_switches'] for s in snapshots) / len(snapshots)

    # Find peak hour
    from collections import defaultdict
    hour_scores  = defaultdict(list)
    for s in snapshots:
        try:
            hour = int(s['timestamp'][11:13])
            hour_scores[hour].append(s['focus_score'])
        except: pass

    peak_hour = max(
        hour_scores.items(),
        key=lambda x: sum(x[1])/len(x[1])
    )[0] if hour_scores else 10

    peak_label = (
        f"{peak_hour}am" if peak_hour < 12
        else f"{peak_hour-12}pm" if peak_hour > 12
        else "12pm"
    )

    # Generate tip
    if avg_switches > 15:
        tip = f"You switch context {avg_switches:.0f} times a day on average. Try 90-minute focus blocks with phone in another room."
    elif avg_focus < 60:
        tip = f"Your peak focus is at {peak_label}. Protect that time — no meetings, no Slack."
    elif avg_focus >= 80:
        tip = f"You're performing at {avg_focus:.0f}/100 — exceptional. Keep protecting your {peak_label} deep work window."
    else:
        tip = f"Your best focus window is {peak_label}. Schedule your most important work there every day."

    return {
        "tip":        tip,
        "based_on":   "behavior_patterns",
        "peak_hour":  peak_label,
        "avg_focus":  round(avg_focus),
        "avg_switches": round(avg_switches)
    }

if __name__ == "__main__":
    import uvicorn
    print("🧠 NEWCOS Backend starting on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        