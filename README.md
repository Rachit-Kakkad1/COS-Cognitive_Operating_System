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
NEWCOS/
├── cos-ai-core/          # Python daemon — capture, embed, voice, graph
├── cos-backend/          # FastAPI — FAISS, SQLite, recall engine
├── cos-desktop-ui/       # React + Vite — Home, Ask, Timeline, Focus
├── cos-extension/        # Chrome Manifest V3 — browser context capture
└── README.md
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

---

## 🧩 Chrome Extension Setup

### Load in Chrome
1. Open Chrome → go to `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select `C:\Users\kakka\OneDrive\Desktop\NEWCOS\cos-extension\`
5. Pin the COS extension to your toolbar

### What it captures
- Active tab URL + title (every 30 seconds)
- Visible page text — headings, paragraphs, meta description
- Time spent on each tab
- Sends everything to COS backend at http://localhost:8000/memory

### Offline behaviour
- If backend is down, snapshots queue locally (max 50)
- Queue flushes automatically when backend comes back online

### Demo tip
- Open the extension popup during demo to show live capture status
- Green dot = backend connected = judges see it working in real time
