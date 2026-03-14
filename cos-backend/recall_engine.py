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
    """
    Execute a smart recall query.

    Args:
        query: Natural language query string.
        k: Number of results to return.

    Returns:
        dict with 'query' and 'results' list.
    """
    embed_fn = _get_embed_fn()
    query_embedding = embed_fn(query)

    # FAISS search → top-k memory_ids
    memory_ids = vector_store.search(query_embedding, k=k)

    # SQLite lookup → full records
    results = []
    for i, mid in enumerate(memory_ids):
        memory = get_memory_by_id(mid)
        if not memory:
            continue
        entry = {
            "summary": memory.get("summary", ""),
            "app": memory.get("app", ""),
            "timestamp": memory.get("timestamp", ""),
            "memory_id": mid,
        }
        # Add suggestion to top result only
        if i == 0:
            entry["suggestion"] = f"Would you like to reopen {memory.get('app', 'the app')}?"
        results.append(entry)

    print(f"[Recall] Query: '{query}' → {len(results)} results")

    return {
        "query": query,
        "results": results,
    }
