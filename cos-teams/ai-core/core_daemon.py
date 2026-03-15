"""
COS Teams — Core Daemon.
Posts snapshots to COS Teams backend (port 8002) /team/snapshot.
Load MEMBER_TOKEN from env: COS_MEMBER_TOKEN.
"""

import sys
import os
import time
import requests
import keyboard

# Use sibling cos-ai-core for pipeline and capture
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "cos-ai-core"))

from context_capture import start_capture_loop
from processing_pipeline import process_snapshot

try:
    from drift_detector import start_drift_detection
    DRIFT_AVAILABLE = True
except ImportError:
    DRIFT_AVAILABLE = False

BACKEND_URL = os.getenv("COS_TEAMS_BACKEND", "http://localhost:8002")
MEMBER_TOKEN = os.getenv("COS_MEMBER_TOKEN", "")

_current_app = "Unknown"
_current_embedding = None
_context_switches = 0
_session_start = time.time()
_last_app = ""


def _on_snapshot(snapshot: dict):
    global _current_app, _current_embedding, _context_switches, _last_app
    try:
        _current_app = snapshot.get("app", "Unknown")
        result = process_snapshot(snapshot)
        _current_embedding = result.get("embedding")
        if _last_app and _last_app != _current_app:
            _context_switches += 1
        _last_app = _current_app

        if not MEMBER_TOKEN:
            print("[COS Teams] COS_MEMBER_TOKEN not set — snapshot skipped")
            return

        session_minutes = int((time.time() - _session_start) / 60)
        requests.post(
            f"{BACKEND_URL}/team/snapshot",
            json={
                "app": snapshot.get("app", "Unknown"),
                "title": snapshot.get("title", ""),
                "text": snapshot.get("text", ""),
                "timestamp": snapshot.get("timestamp") or time.strftime("%Y-%m-%d %H:%M"),
                "focus_score": 75,
                "context_switches": _context_switches,
            },
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {MEMBER_TOKEN}"},
            timeout=5,
        )
        print(f"[COS Teams] Snapshot posted: {_current_app} · {snapshot.get('title', '')[:40]}")
    except requests.exceptions.ConnectionError:
        print("[COS Teams] Backend unreachable — snapshot skipped")
    except Exception as e:
        print(f"[COS Teams] Snapshot error: {e}")


def _get_current_for_drift():
    return _current_app, _current_embedding


def _hotkey_recall():
    if not MEMBER_TOKEN:
        return
    print("[COS Teams] Ctrl+Shift+R → recall")
    try:
        r = requests.get(f"{BACKEND_URL}/recall?query=last+thing&k=1", headers={"Authorization": f"Bearer {MEMBER_TOKEN}"}, timeout=3)
        data = r.json()
        if data.get("results"):
            print(f"[COS Teams] Top: {data['results'][0].get('summary', '')[:60]}")
    except Exception as e:
        print(f"[COS Teams] Recall error: {e}")


if __name__ == "__main__":
    print("=" * 44)
    print("  COS Teams AI Core Daemon (port 8002)  ")
    print("=" * 44)
    if not MEMBER_TOKEN:
        print("  Set COS_MEMBER_TOKEN to post snapshots.")
    start_capture_loop(_on_snapshot, interval=30)
    print("[Daemon] Binding hotkey: Ctrl+Shift+R")
    keyboard.add_hotkey("ctrl+shift+r", _hotkey_recall)
    if DRIFT_AVAILABLE:
        start_drift_detection(_get_current_for_drift, interval=10)
    print("\n⚡ COS Teams Daemon running. Press Ctrl+C to stop.\n")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[Daemon] Shutting down.")
