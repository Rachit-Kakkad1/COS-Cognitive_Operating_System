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
import pyttsx3
import pygetwindow as gw

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

BACKEND_URL = "http://localhost:8004"
EMP_TOKEN = os.getenv("COS_EMP_TOKEN", "")

# context tracking
_current_app = "Unknown"
_current_embedding = None

# --- SESSION TRACKING (FIX 1) ---
_session_start_time: float = time.time()
_session_app: str = ""
_session_title: str = ""
_session_switches: int = 0
_total_switches_today: int = 0

def update_session_tracking(current_app: str, current_title: str):
    global _session_start_time, _session_app, _session_title, _session_switches, _total_switches_today
    if current_app != _session_app:
        _session_switches += 1
        _total_switches_today += 1
        _session_app = current_app
        _session_title = current_title
        _session_start_time = time.time()
    else:
        _session_title = current_title

def get_session_minutes() -> int:
    return max(0, int((time.time() - _session_start_time) / 60))

def get_focus_score(app: str, session_minutes: int, switches_today: int) -> int:
    DISTRACTING = ["youtube", "instagram", "netflix", "facebook", "twitter", "tiktok", "reddit", "whatsapp", "telegram"]
    PRODUCTIVE = ["code", "pycharm", "figma", "notion", "excel", "word", "terminal", "github", "postman", "chrome", "firefox"]
    score = 100
    score -= min(switches_today * 4, 60)
    score += min(session_minutes // 10, 20)
    app_lower = app.lower()
    if any(d in app_lower for d in DISTRACTING): score -= 40
    if any(p in app_lower for p in PRODUCTIVE):  score += 10
    return max(0, min(100, score))
# --------------------------------


def _on_snapshot(snapshot: dict):
    """Called by context_capture on every new snapshot. Sends to backend."""
    global _current_app, _current_embedding
    try:
        _current_app = snapshot.get("app", "Unknown")
        # Embed locally for drift detection
        result = process_snapshot(snapshot)
        _current_embedding = result.get("embedding")

        update_session_tracking(_current_app, snapshot.get("title", ""))

        # Send to backend for storage
        requests.post(f"{BACKEND_URL}/memory", json=snapshot, timeout=5)

        # Post WorkSense snapshot
        session_minutes = get_session_minutes()
        post_worksense_snapshot(
            app=_current_app,
            title=snapshot.get("title", ""),
            context_switches=_total_switches_today,
            session_minutes=session_minutes,
            is_idle=False,
        )
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


def post_worksense_snapshot(app: str, title: str,
                             context_switches: int = 0,
                             session_minutes: int = 0,
                             is_idle: bool = False):
    """Posts cognitive snapshot to WorkSense every 30 seconds."""
    if not EMP_TOKEN:
        return  # Skip if not WorkSense employee
    try:
        requests.post(
            f"{BACKEND_URL}/worksense/employee/snapshot",
            json={
                "app":              app,
                "title":            title,
                "context_switches": context_switches,
                "session_minutes":  session_minutes,
                "is_idle":          is_idle,
            },
            headers={"Authorization": f"Bearer {EMP_TOKEN}"},
            timeout=2,
        )
        print(f"[WorkSense] Snapshot posted: {app} · switches:{context_switches}")
    except Exception as e:
        print(f"[WorkSense] Snapshot failed (backend offline): {e}")


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


def speak(text: str):
    """Voice output using pyttsx3."""
    print(f"[Speak] {text}")
    try:
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"[Speak] Error: {e}")


# --- REAL VOICE LISTENER (FIX 2) ---
SAMPLE_RATE   = 16000
FRAME_SAMPLES = int(SAMPLE_RATE * 30 / 1000)

YES_WORDS = ["yes", "yeah", "yep", "sure", "ok", "okay", "go back", "back", "return", "resume", "take me back"]
NO_WORDS  = ["no", "nope", "stay", "stay here", "ignore", "dismiss", "cancel", "never mind"]

_whisper_model_cache = None
def _get_whisper():
    global _whisper_model_cache
    if _whisper_model_cache is None:
        import whisper
        print("[Voice] Loading Whisper small...")
        _whisper_model_cache = whisper.load_model("small")
    return _whisper_model_cache

def listen_for_yes_no(timeout: int = 8) -> str:
    print("[Voice] Listening for response (yes/no)...")
    try:
        import sounddevice as sd
        import noisereduce as nr
        import webrtcvad
    except ImportError:
        print("[Voice] Missing dependencies (sounddevice, noisereduce, webrtcvad)")
        return "unclear"

    vad = webrtcvad.Vad(2)
    speech_buf, silence_ct, speaking = [], 0, False
    done_event = threading.Event()
    frame_ct = [0]
    max_frames = int(timeout * 1000 / 30)

    def audio_callback(indata, frames, time_info, status):
        if frame_ct[0] >= max_frames:
            done_event.set(); raise sd.CallbackStop()
        raw = indata[:, 0].copy().astype(np.float32)
        try: clean = nr.reduce_noise(y=raw, sr=SAMPLE_RATE, stationary=True, prop_decrease=0.75).astype(np.float32)
        except: clean = raw
        pcm = (clean * 32768).astype(np.int16).tobytes()
        try: is_voice = vad.is_speech(pcm, SAMPLE_RATE)
        except: is_voice = False
        nonlocal silence_ct, speaking
        if is_voice:
            speaking, silence_ct = True, 0
            speech_buf.append(clean)
        elif speaking:
            silence_ct += 1
            speech_buf.append(clean)
            if silence_ct >= 20: done_event.set(); raise sd.CallbackStop()
        frame_ct[0] += 1

    try:
        with sd.InputStream(samplerate=SAMPLE_RATE, channels=1, blocksize=FRAME_SAMPLES, dtype=np.float32, callback=audio_callback):
            done_event.wait(timeout=timeout + 1)
    except sd.CallbackStop: pass
    except Exception as e: print(f"[Voice] Error: {e}"); return "unclear"

    if not speech_buf or len(speech_buf) < 4: return "unclear"
    try:
        audio = np.concatenate(speech_buf)
        model = _get_whisper()
        result = model.transcribe(audio, fp16=False, language="en", temperature=0.0)
        text = result["text"].strip().lower()
        print(f"[Voice] Heard: '{text}'")
        if any(w in text for w in YES_WORDS): return "yes"
        if any(w in text for w in NO_WORDS):  return "no"
        return "unclear"
    except Exception as e: print(f"[Voice] Transcription error: {e}"); return "unclear"

def _focus_app_window(app_name: str, title_hint: str = ""):
    try:
        import pygetwindow as gw
        all_windows = gw.getAllWindows()
        if title_hint:
            for w in all_windows:
                if title_hint.lower() in w.title.lower() and w.title:
                    w.activate(); print(f"[Focus] Activated: {w.title}"); return
        for w in all_windows:
            if app_name.lower() in w.title.lower() and w.title:
                w.activate(); print(f"[Focus] Activated: {w.title}"); return
    except Exception as e: print(f"[Focus] Error: {e}")

def on_drift_detected(prev_app, app, prev_emb, emb, sim):
    session_mins = get_session_minutes()
    focus = get_focus_score(prev_app, session_mins, _total_switches_today)
    
    # Notify Backend
    try:
        requests.post(f"{BACKEND_URL}/intervention/drift_v2", json={
            "from_app": prev_app, "from_title": _session_title,
            "focus_score": focus, "session_minutes": session_mins, "to_app": app
        }, timeout=2)
    except: pass

    def _intervention_thread():
        msg = f"Hey! You were working on {_session_title or prev_app} for {session_mins} minutes with a focus score of {focus}. Would you like to go back?"
        speak(msg)
        time.sleep(0.8)
        resp = listen_for_yes_no()
        if resp == "yes":
            speak("Taking you back now!")
            _focus_app_window(prev_app, _session_title)
            requests.post(f"{BACKEND_URL}/intervention/respond", json={"response": "yes"}, timeout=2)
            requests.post(f"{BACKEND_URL}/intervention/reopen", timeout=2)
        elif resp == "no":
            requests.post(f"{BACKEND_URL}/intervention/respond", json={"response": "no"}, timeout=2)
        else:
            speak("Tap yes or no on the screen.")
    
    threading.Thread(target=_intervention_thread, daemon=True).start()
    
    # Reset tracking for new app
    global _session_start_time, _session_app, _session_title
    _session_start_time = time.time()
    _session_app = app
    _session_title = ""


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
    start_drift_detection(_get_current_for_drift, on_drift=on_drift_detected, interval=10)

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
