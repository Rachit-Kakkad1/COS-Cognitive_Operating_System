"""
seed_db.py
──────────
Run once to populate worksense.db with:
  - 1 organization  (Acme Corp)
  - 1 manager       (manager@acme.com / password123)
  - 5 employees     (EMP001-ACME through EMP005-ACME)

Usage:
    python seed_db.py

Safe to re-run — skips if data already exists.
"""

import sqlite3
import bcrypt
import uuid
import os
from datetime import datetime

DB_PATH = os.path.join(
    os.path.dirname(__file__), "data", "worksense.db"
)

def seed():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")

    # ── Create tables if they don't exist ────────────────────────────
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS organizations (
            org_id        TEXT PRIMARY KEY,
            org_name      TEXT NOT NULL,
            org_code      TEXT UNIQUE NOT NULL,
            manager_email TEXT NOT NULL,
            manager_pw    TEXT NOT NULL,
            plan          TEXT DEFAULT 'starter',
            created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS employees (
            emp_id        TEXT PRIMARY KEY,
            org_id        TEXT NOT NULL,
            emp_code      TEXT UNIQUE NOT NULL,
            temp_pw       TEXT NOT NULL,
            name          TEXT,
            department    TEXT,
            is_active     INTEGER DEFAULT 1,
            created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS employee_snapshots (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_id            TEXT NOT NULL,
            org_id            TEXT NOT NULL,
            app               TEXT,
            title             TEXT,
            focus_score       INTEGER DEFAULT 0,
            context_switches  INTEGER DEFAULT 0,
            session_minutes   INTEGER DEFAULT 0,
            is_idle           INTEGER DEFAULT 0,
            timestamp         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tab_switches (
            id                   INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_id               TEXT NOT NULL,
            org_id               TEXT NOT NULL,
            from_app             TEXT,
            from_title           TEXT,
            from_focus_score     INTEGER,
            from_session_minutes INTEGER,
            to_app               TEXT,
            to_title             TEXT,
            user_returned        INTEGER DEFAULT 0,
            timestamp            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS intervention_events (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_id           TEXT,
            org_id           TEXT,
            from_app         TEXT,
            from_title       TEXT,
            focus_score      INTEGER,
            session_minutes  INTEGER,
            to_app           TEXT,
            user_returned    INTEGER DEFAULT 0,
            voice_response   TEXT,
            timestamp        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # ── Check if already seeded ───────────────────────────────────────
    existing = conn.execute(
        "SELECT COUNT(*) FROM organizations"
    ).fetchone()[0]

    if existing > 0:
        print("✅ Database already seeded — skipping.")
        print_credentials()
        conn.close()
        return

    # ── Seed organization ─────────────────────────────────────────────
    org_id   = str(uuid.uuid4())
    org_code = "ACME-2026"
    mgr_pw   = bcrypt.hashpw(
        b"password123", bcrypt.gensalt(12)
    ).decode()

    conn.execute("""
        INSERT INTO organizations
            (org_id, org_name, org_code, manager_email, manager_pw, plan)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (org_id, "Acme Corp", org_code,
          "manager@acme.com", mgr_pw, "worksense"))

    # ── Seed employees ────────────────────────────────────────────────
    employees = [
        ("Rahul Sharma",   "Engineering",  "EMP001"),
        ("Priya Patel",    "Design",       "EMP002"),
        ("Arjun Mehta",    "Engineering",  "EMP003"),
        ("Sneha Gupta",    "Marketing",    "EMP004"),
        ("Karan Singh",    "Engineering",  "EMP005"),
    ]

    emp_records = []
    for name, dept, code_prefix in employees:
        emp_id   = str(uuid.uuid4())
        emp_code = f"{code_prefix}-{org_code}"
        raw_pw   = "employee123"
        hashed   = bcrypt.hashpw(
            raw_pw.encode(), bcrypt.gensalt(12)
        ).decode()
        conn.execute("""
            INSERT INTO employees
                (emp_id, org_id, emp_code, temp_pw, name, department)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (emp_id, org_id, emp_code, hashed, name, dept))
        emp_records.append((emp_code, raw_pw, name))

    # ── Seed some demo snapshots so dashboard isn't empty ────────────
    demo_apps = [
        ("VS Code",  "core_daemon.py — voice pipeline",  91, 2,  47),
        ("Figma",    "Dashboard wireframes",              87, 4,  34),
        ("Chrome",   "FastAPI Documentation",             78, 6,  22),
        ("Gmail",    "HackCrux Budget Planning",          65, 9,  18),
        ("YouTube",  "lo-fi hip hop radio",               15, 18,  8),
    ]
    emp_ids = conn.execute(
        "SELECT emp_id FROM employees WHERE org_id=?", (org_id,)
    ).fetchall()

    for i, emp_row in enumerate(emp_ids):
        app_data = demo_apps[i % len(demo_apps)]
        conn.execute("""
            INSERT INTO employee_snapshots
                (emp_id, org_id, app, title,
                 focus_score, context_switches,
                 session_minutes, is_idle)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (emp_row[0], org_id) + app_data + (0,))

    conn.commit()
    conn.close()

    print("✅ Database seeded successfully!\n")
    print("=" * 50)
    print("  MANAGER LOGIN")
    print("=" * 50)
    print("  Email:    manager@acme.com")
    print("  Password: password123")
    print("  URL:      http://localhost:5176/dashboard")
    print()
    print("=" * 50)
    print("  EMPLOYEE LOGINS (password: employee123)")
    print("=" * 50)
    for code, pw, name in emp_records:
        print(f"  {code:<20} {name}")
    print("=" * 50)

def print_credentials():
    print("=" * 50)
    print("  MANAGER:   manager@acme.com / password123")
    print("  EMPLOYEES: EMP001-ACME-2026 through EMP005-ACME-2026")
    print("             password: employee123")
    print("=" * 50)

def verify():
    """Quick verification — run after seeding."""
    conn = sqlite3.connect(DB_PATH)
    orgs = conn.execute("SELECT * FROM organizations").fetchall()
    emps = conn.execute("SELECT * FROM employees").fetchall()
    snaps = conn.execute("SELECT * FROM employee_snapshots").fetchall()
    conn.close()
    print(f"Orgs:      {len(orgs)}")
    print(f"Employees: {len(emps)}")
    print(f"Snapshots: {len(snaps)}")

if __name__ == "__main__":
    seed()
    print()
    verify()
