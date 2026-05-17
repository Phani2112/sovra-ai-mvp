import json
import pathlib
import re

KB_PATH = pathlib.Path(__file__).parent / "kb.json"

with KB_PATH.open("r", encoding="utf-8") as f:
    KB = json.load(f)

# Common stop words to ignore in keyword matching
STOP_WORDS = {
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'do', 'does', 'did',
    'for', 'from', 'had', 'has', 'have', 'he', 'her', 'his', 'how', 'i', 'if', 'in', 'is',
    'it', 'its', 'just', 'my', 'no', 'not', 'of', 'on', 'or', 'should', 'so', 'that',
    'the', 'to', 'too', 'very', 'was', 'what', 'when', 'which', 'who', 'why', 'will',
    'with', 'would', 'you', 'your', 'this', 'these', 'those', 'am', 'can', 'could'
}


def retrieve_snippets(query: str, max_items: int = 3):
    """Keyword-based retrieval with improved relevance scoring."""
    q = query.lower()

    # Split query and filter out stop words and short words
    query_words = [w for w in q.split() if w not in STOP_WORDS and len(w) > 2]

    # If no meaningful words after filtering, try words of length > 1
    if not query_words:
        query_words = [w for w in q.split() if len(w) > 1]

    if not query_words:
        # Return all items if query is empty
        return [item["content"] for item in KB[:max_items]]

    scored = []

    for item in KB:
        content = item.get("content", "").lower()
        tags = item.get("tags", [])
        tags_str = " ".join(tags).lower()

        score = 0
        matched_words = set()

        for word in query_words:
            # Check for word-boundary matches in content (more precise)
            if re.search(r'\b' + re.escape(word) + r'\b', content):
                score += 2
                matched_words.add(word)
            # Check for word-boundary matches in tags (higher weight)
            if re.search(r'\b' + re.escape(word) + r'\b', tags_str):
                score += 3
                matched_words.add(word)
            # Fallback to substring match if no word boundary match
            elif word in content:
                score += 1
            elif word in tags_str:
                score += 1

        # Bonus score if multiple words matched
        if len(matched_words) > 1:
            score += 2

        if score > 0:
            scored.append((score, item))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)

    # Return content from top items
    results = []
    for score, item in scored[:max_items]:
        results.append(item["content"])

    # If no matches found, return all items as fallback
    if not results:
        results = [item["content"] for item in KB[:max_items]]
    return results
