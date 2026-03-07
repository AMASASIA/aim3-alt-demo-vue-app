class ContextComposer:
    """Select the most relevant memory nodes for a given query.

    Nodes are ranked by a simple product of ``importance`` and ``confidence``.
    The top ``k`` nodes are concatenated into a single context string.
    """
    def __init__(self, top_k: int = 6):
        self.k = top_k

    def build(self, query: str, nodes: list[dict]) -> str:
        """Return a context string composed of the most relevant nodes.

        Parameters
        ----------
        query: str
            The user query (currently unused but kept for future extensions).
        nodes: list[dict]
            Memory nodes each containing ``"importance"``, ``"confidence"`` and ``"content"``.
        """
        # Rank nodes by combined score (importance * confidence)
        ranked = sorted(
            nodes,
            key=lambda n: n.get("importance", 0) * n.get("confidence", 0),
            reverse=True,
        )
        selected = ranked[: self.k]
        # Join the content of selected nodes with newlines
        return "\n".join(node.get("content", "") for node in selected)
