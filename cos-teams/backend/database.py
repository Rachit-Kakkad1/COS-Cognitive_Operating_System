"""
COS Teams — SQLite database.
Teams, members, snapshots, handoffs.
"""

import os
import sqlite3
import logging

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.path.join(DATA_DIR, "teams.db")


def _get_conn() -> sqlite3.Connection:
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS teams (
            team_id       TEXT PRIMARY KEY,
            team_name     TEXT NOT NULL,
            team_code     TEXT UNIQUE NOT NULL,
            founder_email TEXT NOT NULL,
            founder_pw    TEXT NOT NULL,
            created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS team_members (
            member_id     TEXT PRIMARY KEY,
            team_id       TEXT NOT NULL,
            member_code   TEXT UNIQUE NOT NULL,
            temp_pw       TEXT NOT NULL,
            name          TEXT,
            is_active     INTEGER DEFAULT 1,
            created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(team_id) REFERENCES teams(team_id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS team_snapshots (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id       TEXT NOT NULL,
            team_id         TEXT NOT NULL,
            app             TEXT,
            title           TEXT,
            summary         TEXT,
            focus_score     INTEGER DEFAULT 0,
            context_switches INTEGER DEFAULT 0,
            session_minutes INTEGER DEFAULT 0,
            timestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            embedding_id    TEXT,
            FOREIGN KEY(team_id) REFERENCES teams(team_id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS handoffs (
            handoff_id      TEXT PRIMARY KEY,
            from_member     TEXT,
            encrypted_data  TEXT,
            expires_at      TEXT,
            received        INTEGER DEFAULT 0,
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    logger.info(f"[DB] COS Teams tables ready at {DB_PATH}")


init_db()
