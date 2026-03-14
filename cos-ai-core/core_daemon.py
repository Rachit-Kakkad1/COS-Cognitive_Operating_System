"""
NEWCOS — Core Daemon.

Orchestrates: context capture, processing pipeline, drift detection,
voice listener, and hotkey binding.
"""

import sys
import os
import time
import threading
import requests
import keyboard
import numpy as np

# Ensure sibling packages are importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "cos-backend"))

from context_capture import start_capture_loop
from processing_pipeline import process_snapshot, embed_text
from drift_detector import start_drift_detection

try:
    from voice_listener import VoiceListener
    VOICE_AVAILABLE = True
except ImportError as e:
    VOICE_AVAILABLE = False
    print(f"[Daemon] Voice listener unavailable ({e}) — hotkey mode only")

BACKEND_URL = "http://localhost:8000"

# Track current context for drift detection
_current_app = "Unknown"
_current_embedding = None


def _on_snapshot(snapshot: dict):
    """Called by context_capture on every new snapshot. Sends to backend."""
    global _current_app, _current_embedding
    try:
        _current_app = snapshot.get("app", "Unknown")
        # Embed locally for drift detection
        result = process_snapshot(snapshot)
        _current_embedding = result.get("embedding")

        # Send to backend for storage
        requests.post(f"{BACKEND_URL}/memory", json=snapshot, timeout=5)
    except requests.exceptions.ConnectionError:
        print("[Daemon] Backend unreachable — snapshot queued locally only")
    except Exception as e:
        print(f"[Daemon] Snapshot processing error: {e}")


def _get_current_for_drift():
    """Returns (app, embedding) for drift detection."""
    return _current_app, _current_embedding


def _hotkey_recall():
    """Fired by Ctrl+Shift+R — calls /hotkey/recall."""
    print("[Hotkey] Ctrl+Shift+R fired → recall triggered")
    try:
        resp = requests.post(f"{BACKEND_URL}/hotkey/recall", timeout=3)
        data = resp.json()
        result = data.get("result")
        if result:
            print(f"[Hotkey] Top memory: {result.get('summary', '')[:60]}")
        else:
            print("[Hotkey] No memory found.")
    except Exception as e:
        print(f"[Hotkey] Error: {e}")


def _handle_voice_transcript(text: str):
    """Process voice transcript → trigger recall if matching keywords."""
    text_lower = text.lower().strip()
    RECALL_TRIGGERS = [
        "what was i doing", "what am i doing", "resume", "continue",
        "back to", "where was i", "what were we", "pick up where",
    ]
    if any(trigger in text_lower for trigger in RECALL_TRIGGERS):
        print(f"[COS Voice] Recall triggered by: '{text}'")
        try:
            requests.post(f"{BACKEND_URL}/hotkey/recall", timeout=3)
        except Exception:
            pass
    else:
        print(f"[COS Voice] Logged: '{text}'")


if __name__ == "__main__":
    print("=" * 44)
    print("  NEWCOS AI Core Daemon Initializing...  ")
    print("=" * 44)

    # 1. Start context capture loop (every 30s)
    start_capture_loop(_on_snapshot, interval=30)

    # 2. Bind hotkey: Ctrl+Shift+R
    print("[Daemon] Binding hotkey: Ctrl+Shift+R")
    keyboard.add_hotkey("ctrl+shift+r", _hotkey_recall)

    # 3. Start drift detection (every 10s)
    start_drift_detection(_get_current_for_drift, interval=10)

    # 4. Start voice listener (optional)
    voice = None
    if VOICE_AVAILABLE:
        try:
            voice = VoiceListener(on_transcript=_handle_voice_transcript)
            voice.start()
            print("[Daemon] Always-on voice input active")
        except Exception as e:
            print(f"[Daemon] Voice failed: {e} — hotkey mode only")

    print("\n🧠 NEWCOS Daemon running. Press Ctrl+C to stop.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        if voice:
            voice.stop()
        print("\n[Daemon] Shutting down.")
