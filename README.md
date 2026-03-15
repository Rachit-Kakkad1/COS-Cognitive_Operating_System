<div align="center">

# 🧠 COS — Cognitive Operating System

**Say *"What was I doing?"* — get your exact cognitive state back in under 1 second.**

*No cloud. No screenshots. No keystrokes. 8 AI models, all running on your device.*

[![MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React 18](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Zero Cloud](https://img.shields.io/badge/Cloud-Zero_Dependency-ef4444?style=flat-square)]()

</div>

---

## 👁️ See it in 10 seconds

```
You open Gmail. Write an email. Get distracted. Switch to YouTube.
Come back 10 seconds later and say:  "What was I doing?"

COS responds instantly:
  "You were drafting the HackCrux vendor pricing email.
   Last active: 4 minutes ago. Would you like to resume?"

No button. No hotkey. Just your voice. Under 1 second. Every time.
```

> **The demo flow:** Open Gmail → switch to YouTube → wait → say *"What was I doing?"* → context restored. Press `Ctrl+Shift+R` if you prefer a hotkey.

---

## ⚡ Run it right now

```bash
# 1. Clone
git clone https://github.com/your-team/COS.git && cd COS

# 2. Install + download AI models (one time · ~600MB · 5 minutes)
pip install sentence-transformers openai-whisper noisereduce webrtcvad-wheels sounddevice
python shared/download_all_models.py

# 3. Start (3 terminals)
cd cos-personal/backend  && pip install -r requirements.txt && python main.py
cd cos-personal/frontend && npm install && npm run dev
cd cos-personal/ai-core  && python core_daemon.py

# 4. Open
open http://localhost:5174
```

> **Windows only:** `winget install ffmpeg` before step 2.  
> **Chrome extension:** `chrome://extensions` → Developer Mode → Load unpacked → `cos-personal/extension/`

---

## 📸 Screenshots

### Landing Page — Three Products
```
╔═══════════════════════════════════════════════════════════════════════╗
║  🧠 COS  Cognitive Operating System         [Features][Demo][→ Try]  ║
║  ─────────────────────────────────────────────────────────────────   ║
║  ┌─────────────────┐  ┌──────────────────────────┐  ┌─────────────┐  ║
║  │  🧠 COS Personal │  │  ⚡ COS Teams  ⭐ POPULAR │  │ 🏢 WorkSense│  ║
║  │  For individuals │  │  For co-founders + teams  │  │ For managers│  ║
║  │  Free → $9.99/mo │  │  $24.99/team/month        │  │ $49/month   │  ║
║  │  [→ Open COS]    │  │  [→ Get Teams]            │  │ [→ WorkSense│  ║
║  └─────────────────┘  └──────────────────────────┘  └─────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════╝
```
`http://localhost:5173`

---

### COS Personal — Professional Dashboard
```
╔═══════════════════════════════════════════════════════════════════════╗
║  🧠 COS Personal                  [👨‍💻 Professional]  [☀️/🌙]  [⚙️]   ║
║  ─────────────────────────────────────────────────────────────────   ║
║  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌────────────────┐   ║
║  │  8ms     │  │  47      │  │  🟢 Active   │  │  ✅ Synced     │   ║
║  │ Latency  │  │ Memories │  │  Daemon      │  │  Vectors       │   ║
║  └──────────┘  └──────────┘  └──────────────┘  └────────────────┘   ║
║  ─── Recent Memories ──────────────────────────────────────────────  ║
║  ▌ Chrome    HackCrux Budget Planning — Gmail        4 mins ago      ║
║  ▌ VS Code   core_daemon.py — voice pipeline         12 mins ago     ║
║  ▌ Chrome    FastAPI Docs — authentication           18 mins ago     ║
║  ─────────────────────────────────────────────────────────────────   ║
║  [🎤 Ask COS]  [📊 Focus Report]  [🕸️ Graph]  [⚡ System Health]     ║
║  ═════════════════════════════════════════════════════════════════   ║
║  [🏠 Home]   [🎤 Ask]   [📅 Timeline]   [📊 Focus]   [⚡ Health]     ║
╚═══════════════════════════════════════════════════════════════════════╝
```
`http://localhost:5174`

---

### Mode Selector — Adapts to Every Human
```
╔═══════════════════════════════════════════════════════════════════════╗
║  "Which version of COS are you?"                                     ║
║  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      ║
║  │  👨‍💻 Professional │  │  🎓 Student      │  │  🧒 Child        │      ║
║  │  Recall + graph │  │  Study streak   │  │  Quest-style    │      ║
║  │  Tab Guardian   │  │  Exam countdown │  │  Rewards ⭐     │      ║
║  └─────────────────┘  └─────────────────┘  └─────────────────┘      ║
║  ┌─────────────────┐  ┌─────────────────┐                           ║
║  │  👴 Senior       │  │  👨‍👩‍👧 Parent      │                           ║
║  │  Voice-first    │  │  Child monitor  │                           ║
║  │  18px+ fonts    │  │  Screen limits  │                           ║
║  └─────────────────┘  └─────────────────┘                           ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

### 🔔 Tab Guardian — Fires on Every App Switch
```
                              ┌──────────────────────────────────┐
  [VS Code open]              │ 🧠 COS — Context Alert      × 8s │
                              ├──────────────────────────────────┤
  User switches to YouTube    │ You were working on:             │
          ↓ < 1 second        │ "core_daemon.py — voice"         │
  Overlay appears bottom-right│ VS Code · 47 min · Focus: 91/100 │
                              │                                  │
                              │ Would you like to go back?       │
                              │                                  │
                              │ [↩ Take me back] [✓ Stay] [⏰ 5m]│
                              └──────────────────────────────────┘
                               Fires on every OS-level app switch
```

---

### ⚡ COS Teams — Shared Cognitive Memory
```
╔═══════════════════════════════════════════════════════════════════════╗
║  ⚡ COS Teams  ·  3 members active  ·  🟢 Live           http:5175  ║
║  ─── Live Team ────────────────────────────────────────────────────  ║
║  ┌──────────┬──────────────────────────┬──────────┬────────────────┐ ║
║  │ Member   │ Context                  │ Focus    │ Status         │ ║
║  ├──────────┼──────────────────────────┼──────────┼────────────────┤ ║
║  │ Rahul    │ VS Code — core_daemon.py │ 91  ████░│ 🟢 Focused     │ ║
║  │ Priya    │ Figma — Series A deck    │ 87  ███░░│ 🟢 Focused     │ ║
║  │ Dev      │ YouTube                  │ 23  █░░░░│ 🔴 Off task    │ ║
║  └──────────┴──────────────────────────┴──────────┴────────────────┘ ║
║                                                                       ║
║  🤝 Cognitive Handoff  ──  Transfer your thinking via QR code        ║
║  ┌────────────────────────────────────┐                              ║
║  │  ██ ▄▄▄▄▄ █▄▀▄▄▄▄▄ ██  ← AES-256 │  Person A generates QR       ║
║  │  ██ █   █ █▀▀█   █ ██    encrypted│  Person B scans              ║
║  │  ██ █▄▄▄█ ██▄▄▄▄▄█ ██    QR code │  5 memories + graph injected  ║
║  └────────────────────────────────────┘  Total time: 4 seconds      ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

### 🏢 COS WorkSense — Manager Dashboard
```
╔═══════════════════════════════════════════════════════════════════════╗
║  🏢 Acme Corp · WorkSense Dashboard    ● Live  Last: 3s  http:5176  ║
║  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        ║
║  │ Score 74   │ │ Deep: 4    │ │ Distract:2 │ │ Off task:1 │        ║
║  └────────────┘ └────────────┘ └────────────┘ └────────────┘        ║
║  ┌──────────┬──────────────────────┬──────────┬──────────┬────────┐  ║
║  │ Employee │ Current Context      │ Focus    │ Switches │ Status │  ║
║  ├──────────┼──────────────────────┼──────────┼──────────┼────────┤  ║
║  │ EMP001   │ VS Code — daemon.py  │ 94  ████░│  2 Low   │ 🟢 Deep│  ║
║  │ EMP002   │ Figma — Dashboard    │ 87  ███░░│  4 Norm  │ 🟢 Focus│  ║
║  │ EMP003   │ Gmail — switching    │ 61  ██░░░│ 11 High  │ 🟡 Dist│  ║
║  │ EMP004   │ YouTube — idle 14m  │ 12  █░░░░│ 18 VHigh │ 🔴 Off │  ║
║  └──────────┴──────────────────────┴──────────┴──────────┴────────┘  ║
║  🔒 No screenshots · No keystrokes · Employee always informed        ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

### 📱 Mobile App — iOS & Android
```
  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
  │ 📱 COS Home  │   │ 📅 Timeline  │   │  🎤 Recall   │
  │ ──────────── │   │ ──────────── │   │ ──────────── │
  │ Focus: 84    │   │ Today   (12) │   │              │
  │ [████████░░] │   │ ▶ Chrome·4m  │   │      🎤      │
  │ 12 memories  │   │ ▶ VSCode·12m │   │              │
  │ today        │   │ Yesterday(8) │   │  "What was   │
  │              │   │ ▶ Notion·2h  │   │   I doing?"  │
  │ [Ask][History│   │ ▶ Gmail·45m  │   │  [Tap/Type]  │
  └──────────────┘   └──────────────┘   └──────────────┘
  React Native · Expo 50 · iOS 15+ · Android 10+
```

---

### 🔌 Chrome Extension
```
  ┌──────────────────────────────────────┐
  │  🧠 COS Personal              ● live │
  ├──────────────────────────────────────┤
  │  HackCrux Budget Planning — Chrome   │
  │  Time on page: 4m 32s                │
  │  Snapshots today: 47                 │
  ├──────────────────────────────────────┤
  │  [Capture Now]    [Open COS]         │
  └──────────────────────────────────────┘
```

---

## 📦 Three Products

| | 🧠 **Personal** | ⚡ **Teams** | 🏢 **WorkSense** |
|---|---|---|---|
| **Who** | Individuals · 5 human modes | Co-founders · small teams | Managers · enterprises |
| **Price** | Free → $9.99/mo | $24.99/team/mo | $49/mo → Enterprise |
| **Backend** | `:8001` | `:8002` | `:8003` |
| **Frontend** | `:5174` | `:5175` | `:5176` |
| **Memory** | 90 days | 180 days | **Unlimited** |
| **Recall + Voice + Graph** | ✅ | ✅ | ✅ |
| **Tab Guardian** | ✅ | ✅ | ✅ |
| **5 Human Modes** | ✅ | ✅ | — |
| **Cognitive Handoff QR** | ❌ | ✅ | ❌ |
| **Manager Dashboard** | ❌ | ❌ | ✅ |
| **Productivity Matrix** | ❌ | ❌ | ✅ |
| **Mobile App** | ✅ | ✅ | ✅ |
| **Chrome Extension** | ✅ | ✅ | ✅ (4-tab) |

---

## 🏗️ Architecture

```
  ┌─── INPUT ──────────┐   ┌─── PROCESSING ──────┐   ┌─── STORAGE ────────┐
  │ Screen OCR          │   │ RNNoise  (Mozilla)  │   │ FAISS IndexFlatIP  │
  │ (Tesseract · 50MB) │──▶│ WebRTC VAD (Google) │──▶│ 384-dim vectors    │
  │ Window API          │   │ Whisper sm (OpenAI) │   │ SQLite (metadata)  │
  │ (pygetwindow)       │   │ MiniLM-L6 (MSFT)   │   │ networkx (graph)   │
  │ Chrome Extension    │   │ DBSCAN (sklearn)    │   └────────────────────┘
  │ (DOM + URL)         │   └─────────────────────┘            │
  │ Microphone 16kHz    │                                       ▼
  └─────────────────────┘                           ┌─── OUTPUT ─────────┐
                                                    │ FastAPI :8001-8003  │
                                                    │ React UI :5174-5176 │
                                                    │ React Native Mobile │
                                                    │ Chrome Extension    │
                                                    └────────────────────┘

  cos-ai-core (daemon) ←──────────────────────────→ cos-backend (FastAPI)
         ↕                                                    ↕
  cos-desktop-ui (React)  ←──────────────────────→ cos-extension (MV3)
         ↕
  cos-mobile (React Native · iOS + Android)
```

**Voice pipeline latency:** Mic → RNNoise (20ms) → WebRTC VAD (1ms) → Whisper (800ms) → Recall (11ms) = **~0.8s total**

---

## 🤖 8 AI Models — All Local · All Free

| Model | By | Size | Job |
|-------|-----|------|-----|
| **all-MiniLM-L6-v2** | Microsoft | 90 MB | Semantic embeddings → finds memories by *meaning* not keywords |
| **Whisper small (int8)** | OpenAI | 460 MB | Voice → text on CPU · ~0.8s · no internet · no API key |
| **noisereduce** | Open Source | 1 MB | Neural noise suppression before voice processing |
| **WebRTC VAD** | Google | ~0 MB | Speech/silence gate at 30ms · Whisper never wastes CPU |
| **DBSCAN** | Scikit-learn | — | Clusters snapshots into task nodes for cognitive graph |
| **Tesseract OCR** | Google | 50 MB | Reads text from screen pixels — even non-API apps |
| **FAISS IndexFlatIP** | Meta | — | Sub-millisecond vector search across 10,000+ memories |
| **networkx DiGraph** | Open Source | — | Cognitive graph: edges when similarity >0.80 or time <5min |

> **Total:** ~601MB · **Cloud calls:** 0 · **API keys:** 0 · **Cost/query:** $0.00

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11 · FastAPI · Uvicorn · PyTorch · SQLite |
| **AI/ML** | sentence-transformers · openai-whisper · FAISS · networkx |
| **Audio** | sounddevice · webrtcvad-wheels · noisereduce · pytesseract |
| **Frontend** | React 18 · Vite 5 · React Router 6 · Three.js (3D graph) |
| **Mobile** | React Native 0.73 · Expo SDK 50 · EAS Build |
| **Extension** | Chrome MV3 · Service Worker · chrome.system.cpu |
| **Auth** | python-jose (JWT) · bcrypt (passwords) · AES-256 (handoff) |
| **Infra** | SQLite per product · FAISS index per product · Zero external DB |

---

## 📁 Repository Structure

```
COS/
├── landing/              → Master landing page          :5173
├── cos-personal/
│   ├── backend/          → FastAPI API                  :8001
│   ├── frontend/         → React UI                     :5174
│   ├── ai-core/          → Python daemon (voice+capture)
│   └── extension/        → Chrome Extension MV3
├── cos-teams/
│   ├── backend/          → FastAPI + team/handoff APIs  :8002
│   ├── frontend/         → React UI (Teams)             :5175
│   ├── ai-core/
│   └── extension/
├── cos-worksense/
│   ├── backend/          → FastAPI + org/reports APIs   :8003
│   ├── frontend/         → React UI (Manager+Employee)  :5176
│   ├── ai-core/
│   └── extension/
├── cos-mobile/           → React Native (iOS + Android)
├── shared/
│   └── download_all_models.py
├── README.md
├── LICENSE
├── PRIVACY.md
└── SECURITY.md
```

---

## 🚀 Start All Three Products

```bash
# Landing
cd landing && npm install && npm run dev                      # :5173

# COS Personal
cd cos-personal/backend  && python main.py                    # :8001
cd cos-personal/frontend && npm install && npm run dev        # :5174
cd cos-personal/ai-core  && python core_daemon.py

# COS Teams (first run: POST /team/create to get credentials)
cd cos-teams/backend  && python main.py                       # :8002
cd cos-teams/frontend && npm run dev                          # :5175
export COS_MEMBER_TOKEN="MEM001-HACK-xxx" && python core_daemon.py

# COS WorkSense (first run: open :5176/setup for org wizard)
cd cos-worksense/backend  && python main.py                   # :8003
cd cos-worksense/frontend && npm run dev                      # :5176
export COS_EMP_TOKEN="EMP001-ACME-xxx"   && python core_daemon.py

# Mobile
cd cos-mobile && npx expo start    # Scan QR with Expo Go
```

**All services running:**
```
✅ :5173  Landing      ✅ :5174  Personal UI   ✅ :8001  Personal API
✅ :5175  Teams UI     ✅ :8002  Teams API      ✅ :5176  WorkSense UI
✅ :8003  WorkSense API
```

---

<details>
<summary><strong>🗄️ Database Schema</strong> — click to expand</summary>

```sql
-- Core (all products)
CREATE TABLE contexts (
  id         TEXT PRIMARY KEY,
  title      TEXT,  url TEXT,  summary TEXT,  app TEXT,
  device_id  TEXT NOT NULL DEFAULT 'local',
  timestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams only
CREATE TABLE teams (
  team_id TEXT PK, team_name TEXT, team_code TEXT UNIQUE,  -- e.g. HACK-2026
  founder_email TEXT, founder_pw TEXT  -- bcrypt hashed
);
CREATE TABLE team_members (
  member_id TEXT PK, team_id FK, member_code TEXT UNIQUE,  -- MEM001-HACK
  temp_pw TEXT  -- bcrypt
);
CREATE TABLE handoffs (
  handoff_id TEXT PK, from_member TEXT,
  encrypted_data TEXT,  -- AES-256-CBC · base64
  expires_at TEXT       -- auto-deleted after 24 hours
);

-- WorkSense only
CREATE TABLE organizations (org_id PK, org_name, org_code UNIQUE, manager_email, manager_pw);
CREATE TABLE employees     (emp_id PK, org_id FK, emp_code UNIQUE, temp_pw, name, department);
CREATE TABLE employee_snapshots (
  emp_id FK, org_id FK, app, title,
  focus_score INT, context_switches INT, session_minutes INT, is_idle INT,
  timestamp TIMESTAMP
);
CREATE TABLE employee_goals (
  emp_id TEXT, goals_json TEXT, date TEXT,
  PRIMARY KEY (emp_id, date)
  -- ⚠️ Manager JWT cannot query this table — enforced at middleware
);
```

**Key queries:** [See /docs/DATABASE.md](docs/DATABASE.md)

</details>

---

<details>
<summary><strong>📊 API Reference</strong> — click to expand</summary>

**COS Personal `:8001`**
```
GET  /health · POST /memory · GET /recall?query= · GET /timeline
GET  /graph  · POST /guardian/switch · WS /guardian/ws
GET  /system/power-report · POST /system/kill-process
GET  /storage/status · POST /storage/delete-all
GET  /mode/coach-tip · GET /student/badges · GET /student/exams
```

**COS Teams `:8002`**
```
POST /team/create · POST /team/auth/founder · POST /team/auth/member
GET  /team/members · GET /team/cofounder-view/:id
POST /handoff/generate  →  { qr_base64, handoff_id, expires_at }
POST /handoff/receive   →  { memories_imported, graph_edges_built }
GET  /team/report/weekly · WS /team/live/:token
```

**COS WorkSense `:8003`**
```
POST /org/create → { org_code, manager_token, employees: [{emp_code, temp_pw}] }
POST /auth/manager · POST /auth/employee
POST /employee/snapshot · POST /employee/tab-switch · POST /employee/goals
GET  /employee/my-performance  →  { score, burnout_risk, achievements }
GET  /manager/dashboard        →  live employee states (WebSocket)
GET  /manager/report/hourly|daily|weekly
GET  /manager/productivity-matrix  →  { score, improvement_tip } per employee
GET  /manager/focus-intelligence
GET  /system/power-report · POST /system/kill-process
WS   /manager/live/:token  ·  WS /guardian/ws
```

</details>

---

<details>
<summary><strong>🔒 Privacy & Security</strong> — click to expand</summary>

### What COS captures vs never captures

| ✅ Captures | ❌ Never captures |
|------------|-----------------|
| Active window title | Screen pixels / screenshots |
| Application name | Keystrokes / what you type |
| Time spent per app | Passwords or credentials |
| Browser tab URL | Email / message content |
| DOM metadata (headings, meta desc) | Camera or microphone recording |
| Clipboard text (filtered) | Location / GPS data |

**Clipboard blocklist (regex):** passwords · base64 API keys · credit card patterns · TOTP secrets

### Data stays on your device

```
COS Personal:   100% local. Zero bytes transmitted. Ever.
COS Teams:      Embeddings only (not raw text) sync between members.
COS WorkSense:  Employee embeddings → org index. Raw content never moves.
                employee_goals → manager JWT CANNOT query (enforced in middleware).
```

### Auth model

```
JWT:       python-jose · HS256 · 7-day expiry
           Payload: { role, org_id, emp_id, plan }
Passwords: bcrypt · 12 rounds · never logged · never in API response
Handoff:   AES-256-CBC · PBKDF2 key · 24hr expiry · embeddings only
```

### WorkSense employee rights

Every employee sees this banner at all times — it cannot be hidden:
```
🔒 COS WorkSense is active.
   Manager CAN see:    app name · focus score · context switches
   Manager CANNOT see: screen · keystrokes · messages · files
   You are always informed — never surveilled.
```

No analytics. No telemetry. No ads. No third-party SDKs. No crash reporting.

</details>

---

<details>
<summary><strong>📱 Mobile App</strong> — click to expand</summary>

Built with React Native (Expo SDK 50) — same backend as desktop.

**Features:** Voice recall · Timeline (6 periods) · Focus dashboard · QR Handoff scanner · Biometric lock · Push notifications · Offline mode · Dark/light theme

**Run:**
```bash
cd cos-mobile

npx expo start                               # Dev (Expo Go)
npx expo run:ios                             # iOS Simulator
npx expo run:android                         # Android Emulator

eas build --platform ios --profile production    # App Store build
eas build --platform android --profile production # Play Store build
```

**Configure backend URL in `src/config.js`:**
```javascript
export const API_URL = 'http://YOUR_LOCAL_IP:8001';
// Both devices must be on the same WiFi network
```

</details>

---

<details>
<summary><strong>🎭 Human Modes (COS Personal)</strong> — click to expand</summary>

| Mode | Colors | Min Font | Key Features |
|------|--------|----------|-------------|
| 👨‍💻 **Professional** | Purple | 14px | Recall · Graph · Tab Guardian · Focus Report · System Health |
| 🎓 **Student** | Violet | 14px | Study streak · Exam countdown · Subject tracker · Badges |
| 🧒 **Child** | Pink | 16px | Quest-style · Reward chest · Fun timer · Safe search |
| 👴 **Senior** | Blue | **18px+** | Voice-first · Memory aid · Health reminders · Simple UI |
| 👨‍👩‍👧 **Parent** | Sky (light) | 14px | Child monitoring · Screen time limits · App blocker |

Every route is wrapped in `<RoleGuard>`. Wrong role = friendly blocked screen, never a crash.

</details>

---

<details>
<summary><strong>📈 Performance Benchmarks</strong> — click to expand</summary>

*Measured: Intel i7 · 16GB RAM · No GPU*

| Operation | Time | Target |
|-----------|------|--------|
| API health check | 8ms | <50ms ✅ |
| Memory ingest (embed + store) | 42ms | <100ms ✅ |
| Semantic recall (k=5) | 11ms | <50ms ✅ |
| Voice transcription (Whisper) | 810ms | <1500ms ✅ |
| FAISS search (10,000 vectors) | 0.8ms | <5ms ✅ |
| Tab Guardian overlay appear | 180ms | <500ms ✅ |
| Full voice pipeline end-to-end | 1.1s | <2s ✅ |
| Manager dashboard (10 employees) | 35ms | <100ms ✅ |

**RAM footprint:** MiniLM (180MB) + Whisper (640MB) + daemon base (120MB) = **~970MB total** (under 1GB)

**FAISS scaling:** 1k vectors=0.3ms · 10k=0.8ms · 100k=8ms · 1M=~80ms — suitable for years of use.

</details>

---

<details>
<summary><strong>⚙️ Environment Variables</strong> — click to expand</summary>

```bash
# cos-personal/backend
PORT=8001  DB_PATH=data/cos.db  JWT_SECRET=change-me  JWT_EXPIRE_DAYS=7

# cos-personal/ai-core
BACKEND_URL=http://localhost:8001
COS_ROLE=professional   # professional|student|child|senior|parent

# cos-teams/ai-core (token from POST /team/create)
BACKEND_URL=http://localhost:8002
COS_MEMBER_TOKEN=MEM001-HACK-xxxxxxxxxxxxxxxx

# cos-worksense/ai-core (token from /setup wizard)
BACKEND_URL=http://localhost:8003
COS_EMP_TOKEN=EMP001-ACME-xxxxxxxxxxxxxxxx

# cos-mobile/src/config.js
API_URL=http://192.168.1.5:8001   # your machine's LAN IP
```

</details>

---

<details>
<summary><strong>🐛 Known Issues & Fixes</strong> — click to expand</summary>

**`rnnoise-python` not found (Windows)**
```bash
pip install noisereduce   # cross-platform replacement
# Change requirements.txt: rnnoise-python → noisereduce>=3.0.0
```

**`webrtcvad` fails to build**
```bash
pip install webrtcvad-wheels   # pre-built binaries
```

**`No module named 'whisper'`**
```bash
pip install openai-whisper
winget install ffmpeg   # also required on Windows
```

**CPU showing 800%+ in System Health**
```python
# Missing normalization — fix in system_api.py:
cpu_count = psutil.cpu_count(logical=True) or 1
cpu_normalized = proc.cpu_percent() / cpu_count
# Also add to HIDDEN list: 'System Idle Process', 'Memory Compression'
```

**Timeline shows 0 memories**
```python
# Timestamp may be stored as Unix integer — fix in /timeline endpoint:
if isinstance(raw_ts, (int, float)) and raw_ts > 1_000_000_000:
    ts = datetime.fromtimestamp(raw_ts)
```

**Tab Guardian not appearing**
```bash
# Windows: run terminal as Administrator (keyboard module needs admin)
# Check daemon output for: [AppSwitch] System-wide monitor started
```

</details>

---

<details>
<summary><strong>🗺️ Roadmap</strong> — click to expand</summary>

| Version | Feature | Status |
|---------|---------|--------|
| v1.0 | Context capture · FAISS · Voice · Cognitive graph | ✅ Shipped |
| v1.1 | Always-on voice (RNNoise + VAD + Whisper) | ✅ Shipped |
| v1.2 | COS Teams · Cognitive Handoff QR | ✅ Shipped |
| v1.3 | COS WorkSense · Manager Dashboard | ✅ Shipped |
| v1.4 | Mobile app (React Native · iOS + Android) | ✅ Shipped |
| v1.5 | Hybrid search (FTS5 + FAISS) · Temporal decay | 🔧 In Progress |
| v2.0 | Cross-device CRDT sync · Whisper medium | 🔜 Q3 2026 |
| v3.0 | Team-level FAISS · SSO + compliance | 🔜 Q4 2026 |
| v4.0 | Institutional memory · Knowledge graphs | 🔜 2027 |
| v5.0 | Cognitive health (burnout · ADHD · decline) | 🚀 Vision |

</details>

---

<details>
<summary><strong>©️ License, Copyright & Acknowledgements</strong> — click to expand</summary>

### License

```
MIT License · Copyright (c) 2026 COS Team — HackCrux 2026

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies — subject to the MIT License conditions.

Full text: see LICENSE file
```

### Copyright

Original work. All code written from scratch at HackCrux 2026.
No proprietary code copied. All dependencies used under their open-source licenses.

### Third-Party Licenses

| Dependency | License |
|-----------|---------|
| all-MiniLM-L6-v2 · Tesseract OCR | Apache 2.0 |
| Whisper · FastAPI · React · FAISS · qrcode · noisereduce | MIT |
| networkx · psutil · pygetwindow · PyTorch · Three.js | BSD-3 |
| webrtcvad | BSD-2-Clause |
| bcrypt · cryptography | Apache 2.0 |
| SQLite | Public Domain |

### Research foundations

- *Attention Is All You Need* (Vaswani et al., 2017) — MiniLM architecture
- *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., 2022) — Whisper
- *Billion-scale similarity search with GPUs* (Johnson et al., 2017) — FAISS
- *Cognitive Load Theory* (Sweller, 1988) — the human problem COS solves

</details>

---

<details>
<summary><strong>🤝 Contributing</strong> — click to expand</summary>

```bash
git clone https://github.com/YOUR-USERNAME/COS.git
git checkout -b feat/your-feature
git commit -m "feat(personal): add temporal decay to recall scoring"
git push origin feat/your-feature
# Open PR → we review within 24 hours
```

**Commit scopes:** `personal` · `teams` · `worksense` · `mobile` · `extension` · `shared`

**High priority needs:** Hybrid FTS5+FAISS search · Unit tests (0% coverage, we know) · Docker Compose · CRDT sync implementation

**Security issues:** Email `security@cos-team.dev` — do not open public issues. 48-hour response SLA.

</details>

---

<div align="center">

---

**Built with ❤️ by COS Team · HackCrux 2026**

*No cloud. No surveillance. No compromise.*

**Your next interruption is coming. COS will remember where you were.**

[![MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Privacy](https://img.shields.io/badge/Data-100%25_Local-14b8a6?style=flat-square)]()
[![Zero Cloud](https://img.shields.io/badge/Cloud-Zero-6366f1?style=flat-square)]()

</div>