"""
COS WorkSense — SQLite database.
Organizations, employees, snapshots, tab_switches, system_alerts, employee_goals.
"""

import os
import sqlite3
import logging

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.path.join(DATA_DIR, "worksense.db")


def _get_conn() -> sqlite3.Connection:
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS organizations (
            org_id        TEXT PRIMARY KEY,
            org_name      TEXT NOT NULL,
            org_code      TEXT UNIQUE NOT NULL,
            manager_email TEXT NOT NULL,
            manager_pw    TEXT NOT NULL,
            plan          TEXT DEFAULT 'starter',
            created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            emp_id        TEXT PRIMARY KEY,
            org_id        TEXT NOT NULL,
            emp_code      TEXT UNIQUE NOT NULL,
            temp_pw       TEXT NOT NULL,
            name          TEXT,
            department    TEXT,
            is_active     INTEGER DEFAULT 1,
            created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(org_id) REFERENCES organizations(org_id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS employee_snapshots (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_id            TEXT NOT NULL,
            org_id            TEXT NOT NULL,
            app               TEXT,
            title             TEXT,
            summary           TEXT,
            focus_score       INTEGER DEFAULT 0,
            context_switches  INTEGER DEFAULT 0,
            session_minutes   INTEGER DEFAULT 0,
            is_idle           INTEGER DEFAULT 0,
            timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(emp_id) REFERENCES employees(emp_id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tab_switches (
            id                    INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_id                TEXT NOT NULL,
            org_id                TEXT NOT NULL,
            from_app              TEXT,
            from_title            TEXT,
            from_focus_score      INTEGER,
            from_session_minutes  INTEGER,
            to_app                TEXT,
            to_title              TEXT,
            user_returned         INTEGER DEFAULT 0,
            timestamp             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(emp_id) REFERENCES employees(emp_id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS system_alerts (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_id      TEXT,
            org_id      TEXT,
            alert_type  TEXT,
            value       TEXT,
            detail      TEXT,
            resolved    INTEGER DEFAULT 0,
            timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS employee_goals (
            emp_id      TEXT,
            goals_json  TEXT,
            date        TEXT DEFAULT (date('now')),
            PRIMARY KEY (emp_id, date),
            FOREIGN KEY(emp_id) REFERENCES employees(emp_id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS memories (
            memory_id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            app TEXT,
            title TEXT,
            summary TEXT,
            url TEXT,
            emp_id TEXT,
            org_id TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS intervention_events (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_id            TEXT NOT NULL,
            org_id            TEXT NOT NULL,
            from_app          TEXT,
            from_title        TEXT,
            focus_score       INTEGER,
            session_minutes   INTEGER,
            to_app            TEXT,
            user_returned     INTEGER DEFAULT 0,
            timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    logger.info(f"[WorkSense DB] Ready at {DB_PATH}")


def get_all_memories():
    conn = _get_conn()
    rows = conn.execute("SELECT * FROM memories ORDER BY timestamp DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def insert_memory(memory_id: str, timestamp: str, app: str, title: str, summary: str, url: str = None, emp_id: str = None, org_id: str = None):
    conn = _get_conn()
    conn.execute(
        "INSERT OR REPLACE INTO memories (memory_id, timestamp, app, title, summary, url, emp_id, org_id) VALUES (?,?,?,?,?,?,?,?)",
        (memory_id, timestamp, app, title, summary, url or "", emp_id or "", org_id or ""),
    )
    conn.commit()
    conn.close()


init_db()
