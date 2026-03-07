from sentence_transformers import SentenceTransformer, util

# Load the model once at module import time for efficiency
_model = SentenceTransformer("all-MiniLM-L6-v2")

class RelationBuilder:
    """Automatically generate relations between a new memory node and existing nodes.

    The relation is based on cosine similarity of sentence embeddings. If the similarity
    exceeds a threshold (default 0.75), a ``similar_to`` relation is created.
    """
    def __init__(self, similarity_threshold: float = 0.75):
        self.threshold = similarity_threshold

    def link(self, new_node: dict, existing_nodes: list[dict]) -> list[dict]:
        """Return a list of relation dictionaries for the ``new_node``.

        Parameters
        ----------
        new_node: dict
            Must contain a ``"content"`` key with the textual representation.
        existing_nodes: list[dict]
            Each node must contain ``"id"`` and ``"content"`` keys.
        """
        new_vec = _model.encode(new_node["content"], convert_to_tensor=True)
        relations: list[dict] = []
        for node in existing_nodes:
            vec = _model.encode(node["content"], convert_to_tensor=True)
            sim = float(util.cos_sim(new_vec, vec))
            if sim > self.threshold:
                relations.append({
                    "target": node["id"],
                    "type": "similar_to",
                    "weight": sim,
                })
        return relations
