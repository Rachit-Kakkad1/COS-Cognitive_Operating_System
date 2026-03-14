"""
NEWCOS — SQLite Metadata Database.

Stores memory metadata: memory_id, timestamp, app, title, summary, cluster_id.
"""

import os
import sqlite3
import logging

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.path.join(DATA_DIR, "newcos.db")


def _get_conn() -> sqlite3.Connection:
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create memories table if it does not exist."""
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS memories (
            memory_id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            app TEXT,
            title TEXT,
            summary TEXT,
            cluster_id INTEGER DEFAULT NULL
        )
    """)
    conn.commit()
    conn.close()
    logger.info(f"Database initialized at {DB_PATH}")


def insert_memory(memory_id: str, timestamp: str, app: str, title: str, summary: str):
    """Insert a new memory record."""
    conn = _get_conn()
    conn.execute(
        "INSERT OR IGNORE INTO memories (memory_id, timestamp, app, title, summary) VALUES (?, ?, ?, ?, ?)",
        (memory_id, timestamp, app, title, summary),
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
