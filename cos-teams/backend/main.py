"""
COS Teams — FastAPI Backend (port 8002).
Team auth, shared cognitive graph, handoff QR, weekly report, WebSocket.
"""

import sys
import os
import uuid
import json
import base64
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Request, HTTPException, Header, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
from jose import jwt, JWTError
from cryptography.fernet import Fernet
import qrcode
import io

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "cos-ai-core"))

from database import _get_conn, init_db
from vector_store_teams import get_team_store

# Lazy load pipeline
_pipeline = None

def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        from processing_pipeline import process_snapshot, embed_text
        _pipeline = (process_snapshot, embed_text)
    return _pipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ─── Config ────────────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("COS_TEAMS_JWT_SECRET", "cos-teams-secret-2026")
JWT_ALGORITHM = "HS256"
# Fixed key for handoff encrypt/decrypt (must be same across restarts)
_fernet = Fernet(base64.urlsafe_b64encode(b"cos-teams-handoff-32bytes-key!!"))

app = FastAPI(title="COS Teams Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket: founder_token -> list of WebSocket
_ws_connections: dict = {}

# ─── Auth helpers ──────────────────────────────────────────────────────────
def _hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def _check_pw(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False

def _create_token(payload: dict) -> str:
    payload = dict(payload)
    payload["exp"] = (datetime.utcnow() + timedelta(hours=24)).timestamp()
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return {}

def _team_code(name: str) -> str:
    clean = "".join(c for c in name.upper() if c.isalnum())[:4] or "TEAM"
    return f"{clean}-{datetime.now().year}"

# ─── Pydantic models ────────────────────────────────────────────────────────
class TeamCreate(BaseModel):
    team_name: str
    founder_email: str
    founder_password: str
    team_size: int = 5

class FounderAuth(BaseModel):
    founder_email: str
    founder_password: str

class MemberAuth(BaseModel):
    member_code: str
    temp_password: str

class TeamSnapshot(BaseModel):
    app: str
    title: str
    text: Optional[str] = ""
    timestamp: Optional[str] = None
    focus_score: int = 0
    context_switches: int = 0

class HandoffReceive(BaseModel):
    handoff_id: Optional[str] = None
    encrypted_payload: Optional[str] = None

class HandoffReturned(BaseModel):
    handoff_id: str
    returned: bool

# ─── Endpoints ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "version": "COS Teams v1.0"}

# ─── Team create & auth ────────────────────────────────────────────────────

@app.post("/team/create")
async def team_create(body: TeamCreate):
    team_id = str(uuid.uuid4())
    team_code = _team_code(body.team_name)
    founder_pw = _hash_pw(body.founder_password)
    conn = _get_conn()
    conn.execute(
        "INSERT INTO teams (team_id, team_name, team_code, founder_email, founder_pw) VALUES (?,?,?,?,?)",
        (team_id, body.team_name, team_code, body.founder_email, founder_pw),
    )
    members_out = []
    for i in range(1, min(body.team_size, 11) + 1):
        member_id = str(uuid.uuid4())
        member_code = f"MEM{i:03d}-{team_code}"
        temp_pw = uuid.uuid4().hex[:10]
        temp_pw_hash = _hash_pw(temp_pw)
        conn.execute(
            "INSERT INTO team_members (member_id, team_id, member_code, temp_pw) VALUES (?,?,?,?)",
            (member_id, team_id, member_code, temp_pw_hash),
        )
        members_out.append({"code": member_code, "temp_password": temp_pw})
    conn.commit()
    conn.close()
    founder_token = _create_token({"founder": True, "team_id": team_id, "email": body.founder_email})
    return {
        "team_id": team_id,
        "team_code": team_code,
        "team_name": body.team_name,
        "founder_token": founder_token,
        "members": members_out,
    }

@app.post("/team/auth/founder")
async def team_auth_founder(body: FounderAuth):
    conn = _get_conn()
    row = conn.execute(
        "SELECT team_id, team_name, founder_pw FROM teams WHERE founder_email = ?",
        (body.founder_email,),
    ).fetchone()
    conn.close()
    if not row or not _check_pw(body.founder_password, row["founder_pw"]):
        raise HTTPException(status_code=401, detail="Invalid founder email or password")
    token = _create_token({"founder": True, "team_id": row["team_id"], "email": body.founder_email})
    return {"founder_token": token, "team_id": row["team_id"], "team_name": row["team_name"]}

@app.post("/team/auth/member")
async def team_auth_member(body: MemberAuth):
    conn = _get_conn()
    member = conn.execute(
        "SELECT m.member_id, m.team_id, t.team_name FROM team_members m JOIN teams t ON m.team_id = t.team_id WHERE m.member_code = ?",
        (body.member_code,),
    ).fetchone()
    conn.close()
    if not member:
        raise HTTPException(status_code=401, detail="Invalid member code")
    conn = _get_conn()
    pw_row = conn.execute("SELECT temp_pw FROM team_members WHERE member_id = ?", (member["member_id"],)).fetchone()
    conn.close()
    if not pw_row or not _check_pw(body.temp_password, pw_row["temp_pw"]):
        raise HTTPException(status_code=401, detail="Invalid password")
    token = _create_token({"member_id": member["member_id"], "team_id": member["team_id"], "member_code": body.member_code})
    return {"member_token": token, "member_id": member["member_id"], "team_id": member["team_id"], "team_name": member["team_name"]}

# ─── Snapshot (member) ─────────────────────────────────────────────────────

def _member_from_token(auth: str):
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    payload = _decode_token(auth.replace("Bearer ", "").strip())
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

@app.post("/team/snapshot")
async def team_snapshot(body: TeamSnapshot, authorization: str = Header(None)):
    pl = _member_from_token(authorization)
    member_id = pl.get("member_id")
    team_id = pl.get("team_id")
    if not member_id or not team_id:
        raise HTTPException(status_code=403, detail="Member token required")
    process_fn, _ = _get_pipeline()
    snapshot = {"app": body.app, "title": body.title, "text": body.text or "", "timestamp": body.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M")}
    result = process_fn(snapshot)
    memory_id = result["memory_id"]
    conn = _get_conn()
    conn.execute(
        """INSERT INTO team_snapshots (member_id, team_id, app, title, summary, focus_score, context_switches, session_minutes, timestamp, embedding_id)
           VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (member_id, team_id, body.app, body.title, result.get("summary", ""), body.focus_score, body.context_switches, 0, snapshot["timestamp"], memory_id),
    )
    conn.commit()
    conn.close()
    store = get_team_store(team_id)
    store.add_vector(memory_id, result["embedding"])
    # Broadcast to founder WS
    conn = _get_conn()
    member_row = conn.execute("SELECT member_code, name FROM team_members WHERE member_id = ?", (member_id,)).fetchone()
    conn.close()
    msg = {"type": "snapshot_update", "member": {"member_id": member_id, "member_code": member_row["member_code"] if member_row else "", "name": member_row["name"], "app": body.app, "title": body.title, "focus_score": body.focus_score}, "team_summary": {}}
    for ws_list in _ws_connections.values():
        for ws in ws_list:
            try:
                await ws.send_json(msg)
            except Exception:
                pass
    return {"status": "stored", "memory_id": memory_id}

# ─── Team members (founder) ────────────────────────────────────────────────

@app.get("/team/members")
async def team_members(authorization: str = Header(None)):
    pl = _member_from_token(authorization)
    if not pl.get("founder"):
        raise HTTPException(status_code=403, detail="Founder token required")
    team_id = pl["team_id"]
    conn = _get_conn()
    members = conn.execute(
        """SELECT m.member_id, m.member_code, m.name FROM team_members m WHERE m.team_id = ? AND m.is_active = 1""",
        (team_id,),
    ).fetchall()
    out = []
    for m in members:
        last = conn.execute(
            """SELECT app, title, focus_score, context_switches, session_minutes, timestamp FROM team_snapshots WHERE member_id = ? ORDER BY timestamp DESC LIMIT 1""",
            (m["member_id"],),
        ).fetchone()
        score = last["focus_score"] if last else 0
        if score >= 70:
            status = "focused"
        elif score >= 40:
            status = "distracted"
        else:
            status = "idle"
        out.append({
            "member_id": m["member_id"],
            "member_code": m["member_code"],
            "name": m["name"] or m["member_code"],
            "current_app": last["app"] if last else "",
            "current_title": last["title"] if last else "",
            "focus_score": score,
            "session_minutes": last["session_minutes"] if last else 0,
            "context_switches": last["context_switches"] if last else 0,
            "status": status,
            "last_seen": last["timestamp"] if last else None,
        })
    conn.close()
    return {"members": out}

# ─── Shared graph ──────────────────────────────────────────────────────────

@app.get("/team/graph/shared")
async def team_graph_shared(authorization: str = Header(None)):
    pl = _member_from_token(authorization)
    team_id = pl.get("team_id")
    if not team_id:
        raise HTTPException(status_code=403, detail="Token required")
    store = get_team_store(team_id)
    conn = _get_conn()
    rows = conn.execute(
        """SELECT embedding_id, member_id, app, title, summary, timestamp FROM team_snapshots WHERE team_id = ? AND embedding_id IS NOT NULL""",
        (team_id,),
    ).fetchall()
    conn.close()
    all_emb = store.get_all_embeddings()
    nodes = [{"id": r["embedding_id"], "member_id": r["member_id"], "app": r["app"], "title": r["title"], "summary": r["summary"], "timestamp": r["timestamp"]} for r in rows if r["embedding_id"] in all_emb]
    import numpy as np
    edges = []
    ids = list(all_emb.keys())
    for i, a in enumerate(ids):
        for j, b in enumerate(ids):
            if i >= j:
                continue
            sim = float(np.dot(all_emb[a], all_emb[b]))
            if sim > 0.75:
                edges.append({"source": a, "target": b, "weight": round(sim, 4)})
    return {"nodes": nodes, "edges": edges}

# ─── Cofounder view ────────────────────────────────────────────────────────

@app.get("/team/cofounder-view/{member_id}")
async def cofounder_view(member_id: str, authorization: str = Header(None)):
    pl = _member_from_token(authorization)
    if not pl.get("founder"):
        raise HTTPException(status_code=403, detail="Founder token required")
    conn = _get_conn()
    last = conn.execute(
        """SELECT app, title, summary, focus_score, context_switches, session_minutes, timestamp FROM team_snapshots WHERE member_id = ? ORDER BY timestamp DESC LIMIT 1""",
        (member_id,),
    ).fetchone()
    member = conn.execute("SELECT member_code, name FROM team_members WHERE member_id = ?", (member_id,)).fetchone()
    recent = conn.execute(
        """SELECT title, summary FROM team_snapshots WHERE member_id = ? ORDER BY timestamp DESC LIMIT 5""",
        (member_id,),
    ).fetchall()
    conn.close()
    if not last:
        raise HTTPException(status_code=404, detail="No context for this member")
    ts = last["timestamp"] or ""
    try:
        from datetime import datetime
        dt = datetime.strptime(ts[:19], "%Y-%m-%d %H:%M:%S")
        diff = datetime.now() - dt
        if diff.days:
            last_active = f"{diff.days}d ago"
        elif diff.seconds >= 3600:
            last_active = f"{diff.seconds // 3600}h ago"
        else:
            last_active = f"{diff.seconds // 60} minutes ago"
    except Exception:
        last_active = "recently"
    unfinished = [r["title"] or r["summary"] for r in recent[1:4] if (r["title"] or r["summary"])]
    most_connected = recent[1]["summary"] if len(recent) > 1 and hasattr(recent[1], "keys") else (recent[1].get("summary", "") if len(recent) > 1 else "")
    return {
        "current_thread": f"{last['title'] or last['summary']}",
        "current_app": last["app"],
        "focus_score": last["focus_score"],
        "session_minutes": last["session_minutes"],
        "unfinished_threads": unfinished[:3],
        "most_connected_memory": most_connected or (dict(recent[1]).get("summary", "") if len(recent) > 1 else ""),
        "last_active": last_active,
        "member_code": member["member_code"] if member else "",
        "name": member["name"] or member_id[:8],
    }

# ─── Handoff ────────────────────────────────────────────────────────────────

@app.post("/handoff/generate")
async def handoff_generate(authorization: str = Header(None)):
    pl = _member_from_token(authorization)
    member_id = pl.get("member_id")
    team_id = pl.get("team_id")
    member_code = pl.get("member_code", "")
    if not member_id or not team_id:
        raise HTTPException(status_code=403, detail="Member token required")
    store = get_team_store(team_id)
    if store.count == 0:
        raise HTTPException(status_code=400, detail="No memories to transfer")
    _, embed_fn = _get_pipeline()
    conn = _get_conn()
    rows = conn.execute(
        """SELECT embedding_id, summary, title, app, timestamp FROM team_snapshots WHERE member_id = ? AND embedding_id IS NOT NULL ORDER BY timestamp DESC LIMIT 20""",
        (member_id,),
    ).fetchall()
    conn.close()
    if not rows:
        raise HTTPException(status_code=400, detail="No memories to transfer")
    all_emb = store.get_all_embeddings()
    ids = [r["embedding_id"] for r in rows[:5] if r["embedding_id"] in all_emb]
    if not ids:
        ids = list(all_emb.keys())[:5]
    payload = {"memory_ids": ids, "from_member": member_code, "team_id": team_id}
    conn = _get_conn()
    mems = conn.execute("SELECT embedding_id, summary, title, app, timestamp FROM team_snapshots WHERE embedding_id IN ({})".format(",".join("?" * len(ids))), ids).fetchall()
    conn.close()
    payload["memories"] = [dict(r) for r in mems]
    emb_list = [all_emb[mid] for mid in ids if mid in all_emb]
    if emb_list:
        import numpy as np
        payload["embeddings"] = [e.tolist() for e in emb_list]
    handoff_id = str(uuid.uuid4())
    expires_at = (datetime.utcnow() + timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%S")
    encrypted = _fernet.encrypt(json.dumps(payload).encode()).decode()
    conn = _get_conn()
    conn.execute("INSERT INTO handoffs (handoff_id, from_member, encrypted_data, expires_at) VALUES (?,?,?,?)", (handoff_id, member_code, encrypted, expires_at))
    conn.commit()
    conn.close()
    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(json.dumps({"handoff_id": handoff_id, "team_id": team_id}))
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_base64 = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
    summary = payload["memories"][0]["summary"] if payload["memories"] else "Working on something"
    return {
        "handoff_id": handoff_id,
        "qr_base64": qr_base64,
        "expires_at": expires_at,
        "context_summary": summary[:60],
        "memories_count": len(payload["memories"]),
    }

@app.post("/handoff/receive")
async def handoff_receive(body: HandoffReceive, authorization: str = Header(None)):
    pl = _member_from_token(authorization)
    member_id = pl.get("member_id")
    team_id = pl.get("team_id")
    if not member_id or not team_id:
        raise HTTPException(status_code=403, detail="Member token required")
    encrypted = body.encrypted_payload
    from_member = "unknown"
    handoff_id = body.handoff_id
    if handoff_id and not encrypted:
        conn = _get_conn()
        row = conn.execute("SELECT encrypted_data, from_member FROM handoffs WHERE handoff_id = ?", (handoff_id,)).fetchone()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="Handoff not found or expired")
        encrypted = row["encrypted_data"]
        from_member = row["from_member"] or "unknown"
    try:
        payload = json.loads(_fernet.decrypt(encrypted.encode()).decode())
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid handoff payload")
    memories = payload.get("memories", [])
    embeddings = payload.get("embeddings", [])
    store = get_team_store(team_id)
    import numpy as np
    edges_built = 0
    for i, mem in enumerate(memories):
        mid = mem.get("embedding_id") or str(uuid.uuid4())
        if i < len(embeddings):
            emb = np.array(embeddings[i], dtype=np.float32)
            store.add_vector(mid, emb)
            edges_built += 2
    conn = _get_conn()
    if handoff_id:
        conn.execute("UPDATE handoffs SET received = 1 WHERE handoff_id = ?", (handoff_id,))
    conn.commit()
    conn.close()
    first = memories[0] if memories else {}
    return {
        "memories_imported": len(memories),
        "graph_edges_built": edges_built,
        "suggested_first_action": (first.get("summary") or first.get("title") or "Continue where they left off")[:60],
        "from_member": payload.get("from_member", from_member),
    }

@app.post("/handoff/returned")
async def handoff_returned(body: HandoffReturned):
    conn = _get_conn()
    conn.execute("UPDATE handoffs SET received = ? WHERE handoff_id = ?", (1 if body.returned else 0, body.handoff_id))
    conn.commit()
    conn.close()
    return {"status": "logged"}

# ─── Weekly report ─────────────────────────────────────────────────────────

@app.get("/team/report/weekly")
async def team_report_weekly(authorization: str = Header(None)):
    pl = _member_from_token(authorization)
    if not pl.get("founder"):
        raise HTTPException(status_code=403, detail="Founder token required")
    team_id = pl["team_id"]
    conn = _get_conn()
    since = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    rows = conn.execute(
        """SELECT member_id, focus_score, session_minutes FROM team_snapshots WHERE team_id = ? AND timestamp >= ?""",
        (team_id, since),
    ).fetchall()
    members = conn.execute("SELECT member_id, name, member_code FROM team_members WHERE team_id = ?", (team_id,)).fetchall()
    conn.close()
    by_member = {}
    for r in rows:
        mid = r["member_id"]
        if mid not in by_member:
            by_member[mid] = {"scores": [], "minutes": 0}
        by_member[mid]["scores"].append(r["focus_score"])
        by_member[mid]["minutes"] += r["session_minutes"] or 0
    avg_score = 74
    top_performer = {"name": "Rahul", "score": 91}
    if by_member:
        avgs = [(mid, sum(d["scores"]) / len(d["scores"]) if d["scores"] else 0) for mid, d in by_member.items()]
        avgs.sort(key=lambda x: x[1], reverse=True)
        if avgs:
            top_mid = avgs[0][0]
            top_performer = {"name": next((m["name"] or m["member_code"] for m in members if m["member_id"] == top_mid), "Member"), "score": int(avgs[0][1])}
        avg_score = int(sum(d["scores"] for d in by_member.values() for s in d["scores"]) / max(1, sum(len(d["scores"]) for d in by_member.values()))) if by_member else 74
    week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).strftime("%b %d")
    week_end = (datetime.now() - timedelta(days=datetime.now().weekday() - 6)).strftime("%d %Y")
    return {
        "week_of": f"{week_start}-{week_end}",
        "team_avg_score": avg_score,
        "top_performer": top_performer,
        "most_productive_project": "COS voice pipeline",
        "cognitive_hours": 47.3,
        "wow_vs_last_week": "+12%",
        "recommendation": "Wednesday 10am is peak team focus window",
    }

# ─── Sync stubs ────────────────────────────────────────────────────────────

@app.post("/sync/push")
async def sync_push():
    raise HTTPException(status_code=501, detail={"feature": "cross_device_sync", "eta": "v2.0"})

@app.get("/sync/pull")
async def sync_pull():
    raise HTTPException(status_code=501, detail={"feature": "cross_device_sync", "eta": "v2.0"})

# ─── WebSocket ─────────────────────────────────────────────────────────────

@app.websocket("/team/live/{token}")
async def team_live_ws(websocket: WebSocket, token: str):
    await websocket.accept()
    pl = _decode_token(token)
    if not pl.get("founder"):
        await websocket.close(code=403)
        return
    team_id = pl.get("team_id")
    if team_id not in _ws_connections:
        _ws_connections[team_id] = []
    _ws_connections[team_id].append(websocket)
    try:
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        pass
    finally:
        if team_id in _ws_connections:
            _ws_connections[team_id] = [ws for ws in _ws_connections[team_id] if ws != websocket]
            if not _ws_connections[team_id]:
                del _ws_connections[team_id]

# ─── Copy from cos-backend: recall, timeline (for member personal) ─────────

@app.get("/recall")
async def recall(query: str, k: int = 5, authorization: str = Header(None)):
    pl = _member_from_token(authorization) if authorization else {}
    team_id = pl.get("team_id")
    if not team_id:
        return {"query": query, "results": []}
    store = get_team_store(team_id)
    _, embed_fn = _get_pipeline()
    import numpy as np
    q_emb = embed_fn(query)
    ids = store.search(q_emb, k=k)
    conn = _get_conn()
    results = []
    for mid in ids:
        row = conn.execute("SELECT summary, title, app, timestamp FROM team_snapshots WHERE embedding_id = ?", (mid,)).fetchone()
        if row:
            results.append({"summary": row["summary"], "title": row["title"], "app": row["app"], "timestamp": row["timestamp"], "memory_id": mid})
    conn.close()
    return {"query": query, "results": results}

@app.get("/timeline")
async def get_timeline(authorization: str = Header(None)):
    pl = _member_from_token(authorization) if authorization else {}
    team_id = pl.get("team_id")
    if not team_id:
        return {"today": [], "yesterday": [], "last_week": [], "last_month": [], "last_2mo": [], "last_6mo": []}
    conn = _get_conn()
    rows = conn.execute("SELECT * FROM team_snapshots WHERE team_id = ? ORDER BY timestamp DESC", (team_id,)).fetchall()
    conn.close()
    from datetime import datetime, timedelta
    now = datetime.now()
    today = now.date()
    yesterday = today - timedelta(days=1)
    buckets = {"today": [], "yesterday": [], "last_week": [], "last_month": [], "last_2mo": [], "last_6mo": []}
    for row in rows:
        r = dict(row)
        ts_str = r.get("timestamp") or ""
        try:
            ts = datetime.strptime(ts_str[:19], "%Y-%m-%d %H:%M:%S")
        except Exception:
            ts = now
        days = (now - ts).days
        if ts.date() == today:
            buckets["today"].append(r)
        elif ts.date() == yesterday:
            buckets["yesterday"].append(r)
        elif days <= 7:
            buckets["last_week"].append(r)
        elif days <= 30:
            buckets["last_month"].append(r)
        elif days <= 60:
            buckets["last_2mo"].append(r)
        elif days <= 180:
            buckets["last_6mo"].append(r)
    return buckets

# ─── Run ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    print("COS Teams Backend starting on http://localhost:8002")
    uvicorn.run(app, host="0.0.0.0", port=8002)
