"""
NEWCOS — Processing Pipeline.

Embeds raw context snapshots using all-MiniLM-L6-v2 (384-dim).
Returns summary, embedding vector, and unique memory_id.
"""

import uuid
import numpy as np
from sentence_transformers import SentenceTransformer

# Load model once at module level
print("[Pipeline] Loading embedding model: all-MiniLM-L6-v2 ...")
_model = SentenceTransformer("all-MiniLM-L6-v2")
print("[Pipeline] Model loaded.")


def process_snapshot(snapshot: dict) -> dict:
    """
    Process a raw snapshot dict into an embedded memory record.

    Args:
        snapshot: dict with keys: app, title, text, timestamp

    Returns:
        dict with keys: summary, embedding, memory_id, timestamp, app, title
    """
    app = snapshot.get("app", "Unknown")
    title = snapshot.get("title", "Untitled")
    text = snapshot.get("text", "")
    timestamp = snapshot.get("timestamp", "")

    # Build input text for embedding
    input_text = f"{app} {title} {text}".strip()

    # Generate summary
    summary = f"{title[:80]} [{app}]"

    # Generate unique memory ID
    memory_id = uuid.uuid4().hex

    # Generate normalized 384-dim embedding
    embedding = _model.encode(input_text, normalize_embeddings=True)
    embedding = np.array(embedding, dtype=np.float32)

    print(f"[Pipeline] Embedded: {summary[:50]}")

    return {
        "summary": summary,
        "embedding": embedding,
        "memory_id": memory_id,
        "timestamp": timestamp,
        "app": app,
        "title": title,
    }


def embed_text(text: str) -> np.ndarray:
    """Embed arbitrary text — used by recall engine for query embedding."""
    embedding = _model.encode(text, normalize_embeddings=True)
    return np.array(embedding, dtype=np.float32)
