"""
NEWCOS — FastAPI Backend.

Endpoints:
    GET  /health                → status + version
    POST /memory                → ingest a new snapshot
    GET  /recall?query=...&k=5  → smart recall
    GET  /memories?app=..&date= → filtered memory list
    GET  /graph                 → export graph JSON
    GET  /timeline              → memories grouped by timeframe
    POST /hotkey/recall         → fired by Ctrl+Shift+R
"""

import sys
import os
import logging
from datetime import datetime, timedelta

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Add cos-ai-core to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "cos-ai-core"))

from database import insert_memory, get_all_memories, get_memories_by_app, get_memories_by_date, get_memory_by_id
from vector_store import vector_store
from recall_engine import recall

# Lazy import to avoid loading model at import time if not needed
_pipeline = None
_graph_engine = None


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        from processing_pipeline import process_snapshot
        _pipeline = process_snapshot
    return _pipeline


def _get_graph_engine():
    global _graph_engine
    if _graph_engine is None:
        import graph_engine
        _graph_engine = graph_engine
    return _graph_engine


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-20s | %(levelname)-7s | %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="NEWCOS Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request logging middleware ──────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"[API] {request.method} {request.url.path}")
    response = await call_next(request)
    return response


# ─── Models ──────────────────────────────────────────────────────────────
class SnapshotInput(BaseModel):
    app: str
    title: str
    text: Optional[str] = ""
    timestamp: Optional[str] = None


# ─── Endpoints ───────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "version": "NEWCOS v1.0", "memories": vector_store.count}


@app.post("/memory")
async def ingest_memory(snap: SnapshotInput):
    """Ingest a new context snapshot: embed → store in SQLite + FAISS + graph."""
    process = _get_pipeline()
    ge = _get_graph_engine()

    ts = snap.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M")
    snapshot = {"app": snap.app, "title": snap.title, "text": snap.text or "", "timestamp": ts}

    result = process(snapshot)

    # Store in SQLite
    insert_memory(
        memory_id=result["memory_id"],
        timestamp=ts,
        app=snap.app,
        title=snap.title,
        summary=result["summary"],
    )

    # Store in FAISS
    vector_store.add_vector(result["memory_id"], result["embedding"])

    # Add to graph
    ge.add_memory_node(result["memory_id"], result["summary"], snap.app, ts)
    ge.compute_edges(result["memory_id"], result["embedding"], vector_store.get_all_embeddings())

    return {"status": "stored", "memory_id": result["memory_id"]}


@app.get("/recall")
async def recall_endpoint(query: str, k: int = 5):
    """Smart recall: query → embed → FAISS → SQLite → ranked results."""
    return recall(query, k=k)


@app.get("/memories")
async def get_memories(app: Optional[str] = None, date: Optional[str] = None):
    """Filtered memory list by app and/or date."""
    if app:
        return get_memories_by_app(app)
    if date:
        return get_memories_by_date(date)
    return get_all_memories()


@app.get("/graph")
async def get_graph():
    """Export graph JSON for frontend visualization."""
    ge = _get_graph_engine()
    return ge.export_graph_json()


@app.get("/timeline")
async def get_timeline():
    """All memories grouped by: today / yesterday / last_week / last_month."""
    all_memories = get_all_memories()
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    yesterday_str = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    groups = {"today": [], "yesterday": [], "last_week": [], "last_month": []}

    for m in all_memories:
        ts = m.get("timestamp", "")
        if ts.startswith(today_str):
            groups["today"].append(m)
        elif ts.startswith(yesterday_str):
            groups["yesterday"].append(m)
        else:
            try:
                dt = datetime.strptime(ts[:10], "%Y-%m-%d")
                if dt >= week_ago:
                    groups["last_week"].append(m)
                elif dt >= month_ago:
                    groups["last_month"].append(m)
            except ValueError:
                groups["last_month"].append(m)

    return groups


@app.post("/hotkey/recall")
async def hotkey_recall():
    """Fired by Ctrl+Shift+R — returns top recall result."""
    all_memories = get_all_memories()
    if not all_memories:
        return {"result": None, "message": "No memories stored yet."}

    latest = all_memories[0]
    query = f"{latest.get('app', '')} {latest.get('title', '')}"
    result = recall(query, k=1)

    if result["results"]:
        return {"result": result["results"][0]}
    return {"result": None, "message": "No matching memory found."}


if __name__ == "__main__":
    import uvicorn
    print("🧠 NEWCOS Backend starting on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
