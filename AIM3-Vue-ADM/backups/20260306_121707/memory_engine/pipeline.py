import time

from .scorer import MemoryScorer
from .relation_builder import RelationBuilder
from .forgetting_engine import ForgettingEngine
from .context_composer import ContextComposer

def pipeline(input_text: str, memory_db: list[dict]) -> str:
    """Integrated processing pipeline for the Memory Engine.

    Steps:
    1. Score the incoming text to obtain an importance value.
    2. Create a memory node and link it to existing nodes.
    3. Append the node to the memory database.
    4. Apply forgetting/decay to all nodes and prune forgotten ones.
    5. Compose a context string from the most relevant nodes.

    Parameters
    ----------
    input_text: str
        The new piece of information (e.g., user utterance).
    memory_db: list[dict]
        In‑memory list representing the memory store. Each entry must be a dict
        with at least the keys used by the engine (``id``, ``content``, ``timestamp``,
        ``importance``, ``confidence`` and optionally ``ttl``).

    Returns
    -------
    str
        A context string composed of the top‑k relevant memory nodes.
    """
    # Initialise sub‑components
    scorer = MemoryScorer()
    linker = RelationBuilder()
    forgetter = ForgettingEngine()
    composer = ContextComposer()

    # 1️⃣ Score the new input
    score = scorer.score(input_text)

    # 2️⃣ Build the new memory node
    node = {
        "id": str(time.time()),
        "type": "dialogue",
        "content": input_text,
        "timestamp": time.time(),
        "importance": score,
        "confidence": 0.9,
    }

    # 3️⃣ Generate relations to existing nodes
    node["relations"] = linker.link(node, memory_db)

    # 4️⃣ Store the node
    memory_db.append(node)

    # 5️⃣ Apply forgetting decay and prune forgotten nodes
    memory_db[:] = [n for n in memory_db if (f := forgetter.decay(n))]

    # 6️⃣ Compose the final context for downstream LLMs
    context = composer.build(input_text, memory_db)
    return context
