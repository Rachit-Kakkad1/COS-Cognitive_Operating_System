# 🏢 COS WorkSense
## Cognitive Workforce Intelligence
### Ethical. Private. More powerful than CCTV.

## The Difference
Traditional tools → screenshots · keystrokes · surveillance  
COS WorkSense → cognitive patterns · dignity · clarity  

✅ Manager sees: app · focus score · context switches · idle  
❌ Manager never: screen content · keystrokes · messages · files  

Employee ALWAYS knows what is visible.

## Quick Start

### Terminal 1 — Backend
```bash
cd cos-worksense/backend
pip install -r requirements.txt
uvicorn main:app --port 8003 --reload
```
→ http://localhost:8003

### Terminal 2 — Frontend
```bash
cd cos-worksense/frontend
npm install && npm run dev
```
→ http://localhost:5176

### Terminal 3 — AI Core (per employee machine)
```bash
cd cos-worksense/ai-core
set COS_EMP_TOKEN=token_from_manager
pip install -r requirements.txt
python core_daemon.py
```

### Chrome Extension
Load unpacked: `cos-worksense/extension/`  
Ensure backend (8003) and frontend (5176) are running.

## Setup Flow
1. Manager opens http://localhost:5176/setup  
2. Creates org → gets employee codes + passwords  
3. Sends credentials to team  
4. Employees install extension + log in at 5176  
5. Manager sees live dashboard immediately  

## ROI
50-person team → saves 18 mgmt hrs/week  
At $80/hr = $74,880/year saved  
WorkSense = $1,788/year  
ROI: 4,085% · Payback: 8.7 days  

## Pricing
- **Starter:** $49/month · 50 employees  
- **Growth:** $149/month · everything + Slack + mobile  
- **Enterprise:** Custom · SSO + compliance + SLA  

## Ports
- Backend: **8003**  
- Frontend: **5176**  
No conflicts with cos-personal (8001/5174) or cos-teams (8002/5175).
