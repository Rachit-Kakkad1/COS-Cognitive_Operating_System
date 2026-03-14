"""
NEWCOS — Smart Recall Engine.

Query → embed → FAISS search → SQLite lookup → ranked results.
"""

import sys
import os

# Allow importing from cos-backend and cos-ai-core sibling dirs
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "cos-ai-core"))

from vector_store import vector_store
from database import get_memory_by_id

# Lazy-load embedding function to avoid double model loading
_embed_fn = None


def _get_embed_fn():
    global _embed_fn
    if _embed_fn is None:
        from processing_pipeline import embed_text
        _embed_fn = embed_text
    return _embed_fn


def recall(query: str, k: int = 5) -> dict:
    """Execute a smart recall query with recency awareness."""
    
    # 1. Detect temporal intent
    query_lower = query.lower()
    temporal_keywords = ["last", "latest", "recent", "just now", "currently"]
    is_temporal = any(kw in query_lower for kw in temporal_keywords)

    results = []
    
    if is_temporal and any(kw in query_lower for kw in ["thing", "app", "open", "task", "activity", "doing"]):
        # Return most recent items directly for temporal generic queries
        from database import get_all_memories
        recent_mems = get_all_memories()[:k]
        for i, memory in enumerate(recent_mems):
            entry = {
                "summary": memory.get("summary", ""),
                "title": memory.get("title", ""),
                "app": memory.get("app", ""),
                "timestamp": memory.get("timestamp", ""),
                "url": memory.get("url", ""),
                "memory_id": memory.get("memory_id"),
            }
            if i == 0:
                entry["suggestion"] = f"Would you like to resume {memory.get('app', 'the app')}?"
            results.append(entry)
    else:
        # Standard vector search
        embed_fn = _get_embed_fn()
        query_embedding = embed_fn(query)
        memory_ids = vector_store.search(query_embedding, k=k)

        for i, mid in enumerate(memory_ids):
            memory = get_memory_by_id(mid)
            if not memory:
                continue
            entry = {
                "summary": memory.get("summary", ""),
                "title": memory.get("title", ""),
                "app": memory.get("app", ""),
                "timestamp": memory.get("timestamp", ""),
                "url": memory.get("url", ""),
                "memory_id": mid,
            }
            if i == 0:
                entry["suggestion"] = f"Would you like to resume {memory.get('app', 'the app')}?"
            results.append(entry)

    print(f"[Recall] Query: '{query}' → {len(results)} results")

    return {
        "query": query,
        "results": results,
    }
