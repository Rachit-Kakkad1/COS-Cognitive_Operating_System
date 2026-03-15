"""
COS Teams — Per-team FAISS vector store.
One index per team under data/teams/{team_id}/
"""

import os
import pickle
import logging
import numpy as np
import faiss

logger = logging.getLogger(__name__)

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
EMBEDDING_DIM = 384


def _team_dir(team_id: str) -> str:
    d = os.path.join(BASE_DIR, "teams", team_id)
    os.makedirs(d, exist_ok=True)
    return d


class TeamVectorStore:
    def __init__(self, team_id: str):
        self.team_id = team_id
        self.index: faiss.IndexFlatIP = None
        self.memory_ids: list = []
        self._index_path = os.path.join(_team_dir(team_id), "cos_index.faiss")
        self._meta_path = os.path.join(_team_dir(team_id), "cos_meta.pkl")
        self._load()

    def _load(self):
        if os.path.exists(self._index_path) and os.path.exists(self._meta_path):
            try:
                self.index = faiss.read_index(self._index_path)
                with open(self._meta_path, "rb") as f:
                    self.memory_ids = pickle.load(f)
                return
            except Exception as e:
                logger.warning(f"Failed to load team index: {e}")
        self.index = faiss.IndexFlatIP(EMBEDDING_DIM)
        self.memory_ids = []

    def _save(self):
        os.makedirs(os.path.dirname(self._index_path), exist_ok=True)
        faiss.write_index(self.index, self._index_path)
        with open(self._meta_path, "wb") as f:
            pickle.dump(self.memory_ids, f)

    def add_vector(self, memory_id: str, embedding: np.ndarray):
        vec = np.array([embedding], dtype=np.float32)
        faiss.normalize_L2(vec)
        self.index.add(vec)
        self.memory_ids.append(memory_id)
        self._save()

    def search(self, query_embedding: np.ndarray, k: int = 5) -> list:
        if self.index.ntotal == 0:
            return []
        vec = np.array([query_embedding], dtype=np.float32)
        faiss.normalize_L2(vec)
        actual_k = min(k, self.index.ntotal)
        _, indices = self.index.search(vec, actual_k)
        return [self.memory_ids[i] for i in indices[0] if 0 <= i < len(self.memory_ids)]

    def get_all_embeddings(self) -> dict:
        result = {}
        for i, mid in enumerate(self.memory_ids):
            result[mid] = self.index.reconstruct(i)
        return result

    @property
    def count(self):
        return self.index.ntotal


_stores: dict = {}


def get_team_store(team_id: str) -> TeamVectorStore:
    if team_id not in _stores:
        _stores[team_id] = TeamVectorStore(team_id)
    return _stores[team_id]
