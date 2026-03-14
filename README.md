# NEWCOS — Cognitive Operating System (Demo Build)

> Your AI-powered cognitive extension that preserves context and restores focus.

## Quick Start

### 1. Backend
```bash
cd cos-backend
pip install -r requirements.txt
python main.py
```

### 2. AI Core
```bash
cd cos-ai-core
pip install -r requirements.txt
python core_daemon.py
```

### 3. UI
```bash
cd cos-desktop-ui
npm install
npm run dev
```

## Demo Flow
1. Open Gmail → write a fake email
2. Switch to YouTube
3. Wait 10 seconds
4. Press **Ctrl+Shift+R** OR say "What was I doing?"
5. COS responds with your last context

## Endpoints
- **Backend**: http://localhost:8000
- **UI**: http://localhost:5173

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Status + version |
| `/memory` | POST | Ingest a context snapshot |
| `/recall?query=...&k=5` | GET | Smart semantic recall |
| `/memories?app=...&date=...` | GET | Filtered memory list |
| `/graph` | GET | Graph JSON for visualization |
| `/timeline` | GET | Memories grouped by timeframe |
| `/hotkey/recall` | POST | Return top recall result |

## Architecture
```
cos-ai-core/         → Context capture, embedding pipeline, voice, drift detection
cos-backend/          → FastAPI + FAISS + SQLite
cos-desktop-ui/       → React + Vite + Tailwind
```

## Stack
- **Embeddings**: all-MiniLM-L6-v2 (Sentence Transformers, 384-dim)
- **STT**: Whisper small (int8, local CPU)
- **Vector DB**: FAISS IndexFlatIP
- **Metadata**: SQLite
- **Graph**: NetworkX
- **Backend**: FastAPI + Uvicorn
- **Frontend**: React 18 + Vite + Tailwind CSS

Fully local · Fully offline · Zero cost · Zero API keys.
