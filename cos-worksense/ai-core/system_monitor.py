"""
COS WorkSense — CPU monitor.
Alerts backend when any non-system process exceeds 85% CPU.
"""

import os
import time
import threading
import requests

try:
    import psutil
except ImportError:
    psutil = None

BACKEND_URL = os.getenv("COS_WS_BACKEND", "http://localhost:8003")
EMP_TOKEN = os.getenv("COS_EMP_TOKEN", "")
ALERT_THRESHOLD = 85
CLEAR_THRESHOLD = 50
CHECK_INTERVAL = 10
_already_alerted = set()
_lock = threading.Lock()


def _check_cpu():
    if not psutil:
        return
    for proc in psutil.process_iter(["pid", "name", "cpu_percent"]):
        try:
            info = proc.info
            name = info.get("name") or ""
            if name in ("System Idle Process", "System", "Registry", "svchost.exe", "csrss.exe", "wininit.exe", "services.exe", "lsass.exe"):
                continue
            cpu = info.get("cpu_percent") or 0
            pid = info.get("pid")
            if cpu >= ALERT_THRESHOLD and pid:
                with _lock:
                    if pid in _already_alerted:
                        continue
                    _already_alerted.add(pid)
                if EMP_TOKEN:
                    try:
                        requests.post(
                            f"{BACKEND_URL}/employee/system-alert",
                            json={"alert_type": "cpu_spike", "value": str(round(cpu)), "detail": f"{name} (PID {pid})"},
                            headers={"Authorization": f"Bearer {EMP_TOKEN}"},
                            timeout=3,
                        )
                    except Exception:
                        pass
            elif cpu < CLEAR_THRESHOLD and pid:
                with _lock:
                    _already_alerted.discard(pid)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue


def start():
    def run():
        while True:
            _check_cpu()
            time.sleep(CHECK_INTERVAL)

    t = threading.Thread(target=run, daemon=True)
    t.start()
    print("[WorkSense] CPU monitor active — alerts at 85%")


if __name__ == "__main__":
    start()
    while True:
        time.sleep(60)
