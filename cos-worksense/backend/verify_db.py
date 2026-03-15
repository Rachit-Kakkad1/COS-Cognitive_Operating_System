"""Run: python verify_db.py"""
import sqlite3, os
DB = os.path.join(os.path.dirname(__file__),
                  "data", "worksense.db")
conn = sqlite3.connect(DB)
orgs  = conn.execute("SELECT org_id, org_name, org_code, manager_email FROM organizations").fetchall()
emps  = conn.execute("SELECT emp_id, emp_code, name FROM employees").fetchall()
snaps = conn.execute("SELECT COUNT(*) FROM employee_snapshots").fetchone()[0]
conn.close()
print(f"\n{'='*50}")
print(f"  Orgs:      {len(orgs)}")
for o in orgs:
    print(f"    {o[1]} ({o[2]}) — {o[3]}")
print(f"  Employees: {len(emps)}")
for e in emps:
    print(f"    {e[1]} — {e[2]}")
print(f"  Snapshots: {snaps}")
print(f"{'='*50}")
print("  Login: manager@acme.com / password123")
print(f"{'='*50}\n")
