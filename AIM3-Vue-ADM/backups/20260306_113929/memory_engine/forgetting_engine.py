import time

class ForgettingEngine:
    """Decay the importance of a memory node over time based on its TTL.

    If ``ttl`` (time‑to‑live) is not set, the node is returned unchanged.
    Nodes whose importance falls below a threshold are considered forgotten
    and ``None`` is returned so they can be removed from the memory store.
    """
    def __init__(self, min_importance: float = 0.05):
        self.min_importance = min_importance

    def decay(self, node: dict) -> dict | None:
        """Apply exponential decay based on node age.

        Parameters
        ----------
        node: dict
            Must contain ``"timestamp"`` (epoch seconds) and optionally ``"ttl"``.
            ``"importance"`` is updated in‑place.
        Returns
        -------
        dict | None
            The updated node, or ``None`` if the node should be forgotten.
        """
        ttl = node.get("ttl")
        if ttl is None:
            return node

        age = time.time() - node["timestamp"]
        # Ratio can exceed 1 if the node is older than its ttl
        ratio = age / ttl
        # Linear decay – you could replace with exponential if desired
        node["importance"] = max(0.0, node["importance"] * max(0, 1 - ratio))

        if node["importance"] < self.min_importance:
            return None
        return node
