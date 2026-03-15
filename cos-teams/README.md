# ⚡ COS Teams
Shared cognitive memory for co-founders and small teams.

## Quick Start

### Step 1 — Backend (Terminal 1)
```bash
cd cos-teams/backend
pip install -r requirements.txt
python main.py
```
Runs at **http://localhost:8002**

### Step 2 — Frontend (Terminal 2)
```bash
cd cos-teams/frontend
npm install && npm run dev
```
Runs at **http://localhost:5175**

### Step 3 — AI Core per member (Terminal 3)
```bash
cd cos-teams/ai-core
set COS_MEMBER_TOKEN=your_token_here
python core_daemon.py
```
Use the member token from the credentials table after creating a team (or after joining).

### Step 4 — Chrome Extension
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `cos-teams/extension` folder

Send captures to **http://localhost:8002** (COS Teams backend).

## The Handoff Demo
1. Click **🤝 Generate Handoff QR** in the extension or on the Handoff page.
2. QR code appears — show to teammate.
3. Teammate scans (or enters handoff ID) → their COS loads your context.
4. No meeting. No briefing. ~4 seconds.

## Pricing
**$24.99/team/month** · up to 10 people  
14-day free trial · no credit card required  
Data: 180 days per member

## Ports
- Backend: **8002**
- Frontend: **5175**
- No conflict with COS Personal (8000 / 5173) or cos-personal (8001 / 5174).
