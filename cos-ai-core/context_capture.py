"""
NEWCOS — Context Capture Engine.

Captures active window title, process name, and clipboard text every 30 seconds.
Deduplicates identical snapshots. Calls on_snapshot_callback with each new capture.
"""

import threading
import time
from datetime import datetime

try:
    import pygetwindow as gw
except ImportError:
    gw = None

import psutil

try:
    import pyperclip
except ImportError:
    pyperclip = None


def _get_active_app_and_title():
    """Get the active window's app name and title."""
    if gw is None:
        return "Unknown", "Unknown"

    try:
        win = gw.getActiveWindow()
        if win is None:
            return "Unknown", "Unknown"
        title = win.title or "Untitled"
    except Exception:
        return "Unknown", "Unknown"

    # Resolve process name from window title via psutil
    app = "Unknown"
    try:
        for proc in psutil.process_iter(["pid", "name"]):
            try:
                p = psutil.Process(proc.info["pid"])
                if hasattr(p, "cmdline"):
                    pass  # we just need the name
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        # On Windows, use the foreground window's PID
        import ctypes
        user32 = ctypes.windll.user32
        hwnd = user32.GetForegroundWindow()
        pid = ctypes.c_ulong()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        try:
            proc = psutil.Process(pid.value)
            exe = proc.name()
            # Clean up exe name → app name
            app = exe.replace(".exe", "").capitalize()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            app = "Unknown"
    except Exception:
        app = "Unknown"

    return app, title


def _get_clipboard_text():
    """Get current clipboard text, empty string on failure."""
    if pyperclip is None:
        return ""
    try:
        text = pyperclip.paste()
        return text if isinstance(text, str) else ""
    except Exception:
        return ""


def start_capture_loop(on_snapshot_callback, interval=30):
    """
    Start capturing context snapshots in a background daemon thread.

    Args:
        on_snapshot_callback: Function called with snapshot dict on every new capture.
        interval: Seconds between captures (default 30).
    """
    last_key = None

    def _loop():
        nonlocal last_key
        while True:
            app, title = _get_active_app_and_title()
            key = f"{app}-{title}"

            # Deduplicate: skip if identical to last snapshot
            if key != last_key:
                last_key = key
                clipboard = _get_clipboard_text()
                now = datetime.now().strftime("%Y-%m-%d %H:%M")

                snapshot = {
                    "app": app,
                    "title": title,
                    "text": clipboard,
                    "timestamp": now,
                }

                print(f"[Capture] Snapshot: {app} — {title}")
                on_snapshot_callback(snapshot)

            time.sleep(interval)

    t = threading.Thread(target=_loop, daemon=True)
    t.start()
    print(f"[Capture] Context capture loop started (every {interval}s)")
    return t


if __name__ == "__main__":
    def _test(snap):
        print(f"  -> {snap}")

    start_capture_loop(_test, interval=5)
    while True:
        time.sleep(1)
