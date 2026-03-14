"""
NEWCOS — Always-On Voice Listener.

Pipeline: Microphone (16kHz) → RNNoise → WebRTC VAD (30ms) → Whisper small (int8)
"""

import threading
import queue
import numpy as np

try:
    import sounddevice as sd
    SD_AVAILABLE = True
except (ImportError, OSError):
    sd = None
    SD_AVAILABLE = False

try:
    import webrtcvad
    VAD_AVAILABLE = True
except ImportError:
    webrtcvad = None
    VAD_AVAILABLE = False

try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    whisper = None
    WHISPER_AVAILABLE = False

try:
    from rnnoise import RNNoise
    RNNOISE_AVAILABLE = True
except ImportError:
    RNNOISE_AVAILABLE = False


class VoiceListener:
    FRAME_MS = 30
    SILENCE_THRESHOLD = 20
    MIN_SPEECH_FRAMES = 5

    def __init__(self, on_transcript, sample_rate=16000, aggressiveness=2):
        self.on_transcript = on_transcript
        self.sample_rate = sample_rate
        self.frame_samples = int(sample_rate * self.FRAME_MS / 1000)

        if not VAD_AVAILABLE:
            raise ImportError("webrtcvad is required for VoiceListener")
        self.vad = webrtcvad.Vad(aggressiveness)

        self.denoiser = RNNoise() if RNNOISE_AVAILABLE else None

        if WHISPER_AVAILABLE:
            print("[COS Voice] Loading Whisper small model...")
            self.model = whisper.load_model("small", device="cpu")
            print("[COS Voice] Whisper model loaded.")
        else:
            raise ImportError("openai-whisper is required for VoiceListener")

        self._audio_queue = queue.Queue()
        self._speech_buffer = []
        self._silence_count = 0
        self._speech_count = 0
        self._in_speech = False
        self._running = False
        self._stream = None

    def _denoise_frame(self, frame: np.ndarray) -> np.ndarray:
        if self.denoiser is None:
            return frame
        scaled = (frame * 32767.0).astype(np.float32)
        denoised = self.denoiser.process_frame(scaled)
        return np.array(denoised, dtype=np.float32) / 32767.0

    def _is_speech(self, frame: np.ndarray) -> bool:
        try:
            int16_frame = (frame * 32767.0).astype(np.int16).tobytes()
            return self.vad.is_speech(int16_frame, self.sample_rate)
        except Exception:
            return False

    def _audio_callback(self, indata, frames, time, status):
        if status:
            print(f"[COS Voice] Audio status: {status}")
        self._audio_queue.put(indata[:, 0].copy())

    def _process_loop(self):
        remainder = np.array([], dtype=np.float32)
        while self._running:
            try:
                chunk = self._audio_queue.get(timeout=0.1)
            except queue.Empty:
                continue

            audio = np.concatenate([remainder, chunk]) if len(remainder) > 0 else chunk
            offset = 0
            while offset + self.frame_samples <= len(audio):
                frame = audio[offset:offset + self.frame_samples]
                offset += self.frame_samples
                clean_frame = self._denoise_frame(frame)
                if self._is_speech(clean_frame):
                    self._speech_buffer.append(clean_frame)
                    self._speech_count += 1
                    self._silence_count = 0
                    self._in_speech = True
                elif self._in_speech:
                    self._speech_buffer.append(clean_frame)
                    self._silence_count += 1
                    if self._silence_count >= self.SILENCE_THRESHOLD:
                        if self._speech_count >= self.MIN_SPEECH_FRAMES:
                            self._transcribe()
                        self._speech_buffer = []
                        self._speech_count = 0
                        self._silence_count = 0
                        self._in_speech = False
            remainder = audio[offset:] if offset < len(audio) else np.array([], dtype=np.float32)

    def _transcribe(self):
        if not self._speech_buffer:
            return
        audio = np.concatenate(self._speech_buffer).astype(np.float32)
        try:
            result = self.model.transcribe(audio, fp16=False, language="en",
                                            condition_on_previous_text=False, temperature=0.0)
            text = result["text"].strip()
            if text:
                print(f"[COS Voice] Heard: {text}")
                self.on_transcript(text)
        except Exception as e:
            print(f"[COS Voice] Transcription error: {e}")

    def start(self):
        self._running = True
        self._process_thread = threading.Thread(target=self._process_loop, daemon=True)
        self._process_thread.start()
        self._stream = sd.InputStream(samplerate=self.sample_rate, channels=1,
                                       dtype="float32", blocksize=self.frame_samples,
                                       callback=self._audio_callback)
        self._stream.start()
        print("[COS Voice] Listening... (no hotkey needed)")

    def stop(self):
        self._running = False
        if self._stream is not None:
            self._stream.stop()
            self._stream.close()
            self._stream = None
        print("[COS Voice] Stopped.")
