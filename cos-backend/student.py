from fastapi import APIRouter, Request
from datetime import datetime, timedelta
import sqlite3

# Import DB helper from worksense
from worksense import _get_conn

student_router = APIRouter(prefix="/student", tags=["student"])

@student_router.get("/dashboard")
async def student_dashboard():
    """Returns full student dashboard data."""
    conn = _get_conn()

    # Study sessions today
    today_sessions = conn.execute("""
        SELECT app, title, session_minutes, focus_score, timestamp
        FROM employee_snapshots
        WHERE timestamp >= datetime('now', 'start of day')
        AND focus_score > 50
        ORDER BY timestamp DESC
    """).fetchall()

    total_today = sum(s['session_minutes'] for s in today_sessions)

    # Study streak
    streak = conn.execute("""
        SELECT COUNT(DISTINCT date(timestamp)) as streak
        FROM employee_snapshots
        WHERE timestamp >= datetime('now', '-30 days')
        AND focus_score > 60
    """).fetchone()['streak']

    conn.close()
    return {
        "total_study_minutes": total_today,
        "streak_days":         streak,
        "sessions_today":      len(today_sessions),
        "goal_minutes":        240,
        "goal_progress_pct":   min(100, total_today/240*100)
    }

@student_router.post("/exam/add")
async def add_exam(request: Request):
    """Add an upcoming exam with date and subject."""
    data    = await request.json()
    subject = data.get('subject')
    date    = data.get('date')
    conn    = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS exams (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT,
            date    TEXT,
            created TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute(
        "INSERT INTO exams (subject, date) VALUES (?,?)",
        (subject, date)
    )
    conn.commit()
    conn.close()
    return {"status": "added", "subject": subject, "date": date}

@student_router.get("/exams")
async def get_exams():
    """Returns upcoming exams with days remaining."""
    conn  = _get_conn()
    # Create the table if it doesn't exist before querying
    conn.execute("""
        CREATE TABLE IF NOT EXISTS exams (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT,
            date    TEXT,
            created TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    exams = conn.execute(
        "SELECT * FROM exams WHERE date >= date('now') ORDER BY date"
    ).fetchall()
    conn.close()
    result = []
    for e in exams:
        try:
            exam_date    = datetime.strptime(e['date'], '%Y-%m-%d')
            days_left    = (exam_date - datetime.now()).days
            urgency      = (
                'critical' if days_left <= 7  else
                'warning'  if days_left <= 14 else
                'ok'
            )
            result.append({
                'subject':   e['subject'],
                'date':      e['date'],
                'days_left': days_left,
                'urgency':   urgency
            })
        except: pass
    return {"exams": result}

@student_router.get("/badges")
async def get_badges():
    """Returns earned and unearned achievement badges."""
    conn       = _get_conn()
    total_mins = conn.execute("""
        SELECT SUM(session_minutes) as total
        FROM employee_snapshots
        WHERE focus_score > 60
    """).fetchone()['total'] or 0

    streak = conn.execute("""
        SELECT COUNT(DISTINCT date(timestamp)) as s
        FROM employee_snapshots
        WHERE timestamp >= datetime('now','-30 days')
        AND focus_score > 60
    """).fetchone()['s'] or 0
    conn.close()

    badges = [
        {
            'id':     'streak_7',
            'emoji':  '🔥',
            'label':  '7-Day Streak',
            'earned': streak >= 7
        },
        {
            'id':     'hours_10',
            'emoji':  '📚',
            'label':  '10hr Week',
            'earned': total_mins >= 600
        },
        {
            'id':     'focus_master',
            'emoji':  '🎯',
            'label':  'Focus Master',
            'earned': total_mins >= 1200
        },
        {
            'id':     'champion',
            'emoji':  '🏆',
            'label':  'Study Champion',
            'earned': total_mins >= 3000
        },
    ]
    return {"badges": badges, "total_study_hours": round(total_mins/60, 1)}
