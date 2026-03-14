"""
NEWCOS — Context Graph Engine.

Builds a networkx DiGraph of memory nodes. Edges are created based on
cosine similarity (> 0.8) and temporal proximity (< 5 minutes).
"""

import numpy as np
import networkx as nx
from datetime import datetime

_graph = nx.DiGraph()


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    dot = np.dot(a, b)
    norm = np.linalg.norm(a) * np.linalg.norm(b)
    return float(dot / norm) if norm > 0 else 0.0


def _minutes_between(ts1: str, ts2: str) -> float:
    """Parse timestamps and return absolute minutes between them."""
    try:
        fmt = "%Y-%m-%d %H:%M"
        t1 = datetime.strptime(ts1, fmt)
        t2 = datetime.strptime(ts2, fmt)
        return abs((t1 - t2).total_seconds()) / 60.0
    except (ValueError, TypeError):
        return 9999.0


def add_memory_node(memory_id: str, summary: str, app: str, timestamp: str):
    """Add a memory node to the graph."""
    _graph.add_node(
        memory_id,
        summary=summary,
        app=app,
        timestamp=timestamp,
    )


def compute_edges(memory_id: str, embedding: np.ndarray, all_embeddings: dict):
    """
    Compute edges between memory_id and all other nodes.
    Edge added if cosine_similarity > 0.8 OR timestamps within 5 minutes.
    """
    node_data = _graph.nodes.get(memory_id)
    if node_data is None:
        return

    ts = node_data.get("timestamp", "")

    for other_id, other_emb in all_embeddings.items():
        if other_id == memory_id:
            continue
        if not _graph.has_node(other_id):
            continue

        sim = _cosine_similarity(embedding, other_emb)
        other_ts = _graph.nodes[other_id].get("timestamp", "")
        time_close = _minutes_between(ts, other_ts) < 5.0

        if sim > 0.8 or time_close:
            weight = max(sim, 0.5)  # minimum weight for temporal edges
            _graph.add_edge(memory_id, other_id, weight=round(weight, 4))


def get_related_nodes(memory_id: str, depth: int = 2) -> list:
    """Get nodes within N hops of the given memory_id."""
    if memory_id not in _graph:
        return []

    visited = set()
    frontier = {memory_id}

    for _ in range(depth):
        next_frontier = set()
        for node in frontier:
            for neighbor in list(_graph.successors(node)) + list(_graph.predecessors(node)):
                if neighbor not in visited and neighbor != memory_id:
                    next_frontier.add(neighbor)
        visited.update(frontier)
        frontier = next_frontier

    visited.update(frontier)
    visited.discard(memory_id)

    results = []
    for nid in visited:
        data = _graph.nodes[nid]
        results.append({
            "id": nid,
            "summary": data.get("summary", ""),
            "app": data.get("app", ""),
            "timestamp": data.get("timestamp", ""),
        })
    return results


def export_graph_json() -> dict:
    """Export the full graph as JSON for frontend visualization."""
    nodes = []
    for nid, data in _graph.nodes(data=True):
        nodes.append({
            "id": nid,
            "summary": data.get("summary", ""),
            "app": data.get("app", ""),
            "timestamp": data.get("timestamp", ""),
        })

    edges = []
    for src, tgt, data in _graph.edges(data=True):
        edges.append({
            "source": src,
            "target": tgt,
            "weight": data.get("weight", 0.0),
        })

    return {"nodes": nodes, "edges": edges}
