"""
Run: python test_intervention.py
Tests the full intervention API without a real drift event.
"""
import requests, time

BASE = "http://localhost:8004"

print("Test 1 — Fire a drift event...")
r = requests.post(f"{BASE}/intervention/drift_v2", json={
    "from_app":        "VS Code",
    "from_title":      "core_daemon.py",
    "focus_score":     91,
    "session_minutes": 47,
    "to_app":          "YouTube"
})
print(f"  Status: {r.status_code}")
try:
    print(f"  Response: {r.json()}")
except:
    print(f"  Raw Response: {r.text}")

print("Test 2 — Poll /intervention/status...")
time.sleep(0.5)
r = requests.get(f"{BASE}/intervention/status")
d = r.json()
print(f"  Active: {d.get('active')} | from_app: {d.get('from_app')}")
assert d.get("active") == True, "FAIL: intervention not active"
assert d.get("from_app") == "VS Code", "FAIL: wrong from_app"

print("Test 3 — Respond yes...")
r = requests.post(f"{BASE}/intervention/respond",
                  json={"response": "yes"})
print(f"  Status: {r.status_code} — {r.json()}")

print("Test 4 — Status should now be inactive...")
r = requests.get(f"{BASE}/intervention/status")
d = r.json()
print(f"  Active: {d.get('active')}")
assert d.get("active") == False, "FAIL: should be inactive after response"

print("\n✅ All tests passed!")
