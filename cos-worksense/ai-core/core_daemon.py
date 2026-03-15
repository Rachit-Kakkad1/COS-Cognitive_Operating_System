"""
COS WorkSense — AI Core Daemon.
Posts employee snapshots to WorkSense backend (port 8003).
Standalone: no cross-imports.
"""

import os
import time
import threading
import requests

BACKEND_URL = os.getenv("COS_WS_BACKEND", "http://localhost:8003")
EMP_TOKEN = os.getenv("COS_EMP_TOKEN", "")
INTERVAL = 30

_context_switches = 0
_session_start = time.time()
_last_app = ""


def _get_snapshot():
    """Placeholder: in production, integrate with context_capture or extension."""
    return {"app": "Browser", "title": "Active", "text": ""}


def _post_snapshot():
    global _context_switches, _session_start, _last_app
    if not EMP_TOKEN:
        return
    snap = _get_snapshot()
    app = snap.get("app", "Unknown")
    if _last_app and _last_app != app:
        _context_switches += 1
    _last_app = app
    session_minutes = int((time.time() - _session_start) / 60)
    try:
        requests.post(
            f"{BACKEND_URL}/employee/snapshot",
            json={
                "app": app,
                "title": snap.get("title", ""),
                "context_switches": _context_switches,
                "session_minutes": session_minutes,
                "is_idle": False,
            },
            headers={"Authorization": f"Bearer {EMP_TOKEN}"},
            timeout=5,
        )
        print(f"[WorkSense] Snapshot posted: {app} · focus — switches:{_context_switches}")
    except requests.exceptions.ConnectionError:
        print("[WorkSense] Backend unreachable — snapshot skipped")
    except Exception as e:
        print(f"[WorkSense] Snapshot failed: {e}")


def main():
    try:
        from system_monitor import start as start_system_monitor
        start_system_monitor()
    except Exception as e:
        print(f"[WorkSense] System monitor not started: {e}")

    print("[WorkSense] AI Core daemon — posting to", BACKEND_URL)
    print("[WorkSense] Set COS_EMP_TOKEN for employee snapshots.")
    while True:
        _post_snapshot()
        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
