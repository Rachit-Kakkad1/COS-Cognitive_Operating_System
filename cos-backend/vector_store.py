"""
NEWCOS — FAISS Vector Store.

IndexFlatIP with 384 dimensions. L2-normalized vectors give cosine similarity.
Stores memory_id ↔ index position mapping. Auto-saves after every add.
"""

import os
import pickle
import logging
import numpy as np
import faiss

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
INDEX_PATH = os.path.join(DATA_DIR, "cos_index.faiss")
META_PATH = os.path.join(DATA_DIR, "cos_meta.pkl")
EMBEDDING_DIM = 384


class VectorStore:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        self.index: faiss.IndexFlatIP = None
        self.memory_ids: list[str] = []
        self._load()

    def _load(self):
        if os.path.exists(INDEX_PATH) and os.path.exists(META_PATH):
            try:
                self.index = faiss.read_index(INDEX_PATH)
                with open(META_PATH, "rb") as f:
                    self.memory_ids = pickle.load(f)
                logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors.")
                return
            except Exception as e:
                logger.warning(f"Failed to load index: {e}")
        self.index = faiss.IndexFlatIP(EMBEDDING_DIM)
        self.memory_ids = []
        logger.info("Created new FAISS index.")

    def _save(self):
        faiss.write_index(self.index, INDEX_PATH)
        with open(META_PATH, "wb") as f:
            pickle.dump(self.memory_ids, f)

    def add_vector(self, memory_id: str, embedding: np.ndarray):
        """Add a single embedding + memory_id. Auto-saves after add."""
        vec = np.array([embedding], dtype=np.float32)
        faiss.normalize_L2(vec)
        self.index.add(vec)
        self.memory_ids.append(memory_id)
        self._save()
        print(f"[VectorStore] Added: {memory_id[:8]}")

    def search(self, query_embedding: np.ndarray, k: int = 5) -> list[str]:
        """Search for top-k similar vectors. Returns list of memory_id strings."""
        if self.index.ntotal == 0:
            return []
        vec = np.array([query_embedding], dtype=np.float32)
        faiss.normalize_L2(vec)
        actual_k = min(k, self.index.ntotal)
        scores, indices = self.index.search(vec, actual_k)
        results = []
        for idx in indices[0]:
            if 0 <= idx < len(self.memory_ids):
                results.append(self.memory_ids[idx])
        return results

    def get_embedding(self, memory_id: str) -> np.ndarray:
        """Retrieve the stored embedding for a memory_id."""
        if memory_id in self.memory_ids:
            idx = self.memory_ids.index(memory_id)
            return self.index.reconstruct(idx)
        return None

    def get_all_embeddings(self) -> dict:
        """Return dict of {memory_id: embedding} for all stored vectors."""
        result = {}
        for i, mid in enumerate(self.memory_ids):
            result[mid] = self.index.reconstruct(i)
        return result

    def save_index(self, path: str = None):
        self._save()

    def load_index(self, path: str = None):
        self._load()

    @property
    def count(self):
        return self.index.ntotal


# Module-level singleton
vector_store = VectorStore()
