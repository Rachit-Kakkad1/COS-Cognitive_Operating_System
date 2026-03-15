"""
NEWCOS — Drift Detector.

Monitors active app every 10 seconds. If a context switch occurs
AND the cosine similarity between current and previous embeddings
is < 0.4, fires a drift alert (triggers overlay via /hotkey/recall).
"""

import time
import threading
import numpy as np
import requests

BACKEND_URL = "http://localhost:8000"


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    dot = np.dot(a, b)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    return float(dot / norm) if norm > 0 else 0.0


def start_drift_detection(get_current_embedding_fn, on_drift=None, interval=10):
    """
    Start drift detection in a background daemon thread.

    Args:
        get_current_embedding_fn: callable returning (app: str, embedding: np.ndarray)
        on_drift: callback(prev_app, app, prev_embedding, embedding, similarity)
        interval: seconds between checks (default 10)
    """
    prev_app = None
    prev_embedding = None

    def _loop():
        nonlocal prev_app, prev_embedding

        while True:
            try:
                app, embedding = get_current_embedding_fn()
            except Exception:
                time.sleep(interval)
                continue

            if prev_app is not None and app != prev_app:
                # Context switch detected
                if prev_embedding is not None and embedding is not None:
                    sim = _cosine_similarity(embedding, prev_embedding)
                    if sim < 0.4:
                        print(f"[Drift] Context switch detected: {prev_app} → {app} (sim:{sim:.2f})")
                        if on_drift:
                            on_drift(prev_app, app, prev_embedding, embedding, sim)
                        else:
                            # Default fallback
                            try:
                                requests.post(f"{BACKEND_URL}/hotkey/recall", timeout=2)
                            except Exception:
                                pass

            prev_app = app
            if embedding is not None:
                prev_embedding = embedding.copy()

            time.sleep(interval)

    t = threading.Thread(target=_loop, daemon=True)
    t.start()
    print(f"[Drift] Drift detection active (checking every {interval}s)")
    return t
