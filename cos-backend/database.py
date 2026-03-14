"""
NEWCOS — SQLite Metadata Database.

Stores memory metadata: memory_id, timestamp, app, title, summary, cluster_id.
"""

import os
import sqlite3
import logging

from typing import Optional

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.path.join(DATA_DIR, "newcos.db")


def _get_conn() -> sqlite3.Connection:
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create all tables if they do not exist."""
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS memories (
            memory_id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            app TEXT,
            title TEXT,
            summary TEXT,
            url TEXT,
            cluster_id INTEGER DEFAULT NULL
        )
    """)
    # Migrations: add url column if it doesn't exist (primitive)
    try:
        conn.execute("ALTER TABLE memories ADD COLUMN url TEXT")
    except sqlite3.OperationalError:
        pass # already exists

    # ── WorkSense Tables ─────────────────────────────────────────
    conn.execute("""
        CREATE TABLE IF NOT EXISTS organizations (
            org_id TEXT PRIMARY KEY,
            org_name TEXT NOT NULL,
            org_code TEXT UNIQUE NOT NULL,
            manager_email TEXT NOT NULL,
            manager_password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            emp_id TEXT PRIMARY KEY,
            org_id TEXT NOT NULL,
            emp_code TEXT UNIQUE NOT NULL,
            temp_password_hash TEXT NOT NULL,
            name TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (org_id) REFERENCES organizations(org_id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS employee_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_id TEXT NOT NULL,
            org_id TEXT NOT NULL,
            app TEXT,
            title TEXT,
            focus_score INTEGER DEFAULT 0,
            context_switches INTEGER DEFAULT 0,
            session_minutes INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            is_idle INTEGER DEFAULT 0,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (emp_id) REFERENCES employees(emp_id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tab_switches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_id TEXT NOT NULL,
            from_app TEXT,
            from_title TEXT,
            from_focus_score INTEGER,
            from_session_minutes INTEGER,
            to_app TEXT,
            to_title TEXT,
            guardian_shown INTEGER DEFAULT 1,
            user_returned INTEGER DEFAULT 0,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    logger.info("[DB] WorkSense tables ready: organizations, employees, employee_snapshots, tab_switches")

    conn.commit()
    conn.close()
    logger.info(f"Database initialized at {DB_PATH}")


def insert_memory(memory_id: str, timestamp: str, app: str, title: str, summary: str, url: Optional[str] = None):
    """Insert a new memory record."""
    conn = _get_conn()
    conn.execute(
        "INSERT OR IGNORE INTO memories (memory_id, timestamp, app, title, summary, url) VALUES (?, ?, ?, ?, ?, ?)",
        (memory_id, timestamp, app, title, summary, url),
    )
    conn.commit()
    conn.close()


def get_memories_by_app(app: str) -> list:
    """Retrieve all memories for a given app."""
    conn = _get_conn()
    rows = conn.execute(
        "SELECT * FROM memories WHERE app = ? ORDER BY timestamp DESC", (app,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_memories_by_date(date_str: str) -> list:
    """Retrieve memories for a given date (YYYY-MM-DD prefix match)."""
    conn = _get_conn()
    rows = conn.execute(
        "SELECT * FROM memories WHERE timestamp LIKE ? ORDER BY timestamp DESC",
        (f"{date_str}%",),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_all_memories() -> list:
    """Retrieve all memory records sorted by timestamp descending."""
    conn = _get_conn()
    rows = conn.execute(
        "SELECT * FROM memories ORDER BY timestamp DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_memory_by_id(memory_id: str) -> dict:
    """Retrieve a single memory by its ID."""
    conn = _get_conn()
    row = conn.execute(
        "SELECT * FROM memories WHERE memory_id = ?", (memory_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else {}


# Initialize on import
init_db()
