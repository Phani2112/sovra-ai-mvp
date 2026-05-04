import json
import pathlib

KB_PATH = pathlib.Path(__file__).parent / "kb.json"

with KB_PATH.open("r", encoding="utf-8") as f:
    KB = json.load(f)


def retrieve_snippets(query: str, max_items: int = 3):
    """Very simple keyword-based retrieval over kb.json."""
    q = query.lower()
    scored = []

    for item in KB:
        text = (item.get("content", "") + " " +
                " ".join(item.get("tags", []))).lower()
        score = 0
        for word in q.split():
            if word in text:
                score += 1
        if score > 0:
            scored.append((score, item["content"]))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [content for _, content in scored[:max_items]]
