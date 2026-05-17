from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from retriever import retrieve_snippets
import requests
import json

app = FastAPI()

# Allow requests from your local file:// page (origin 'null') and localhost
origins = [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "null",  # for file:// origins in some browsers
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LLAMA_SERVER_URL = "http://127.0.0.1:8080"


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/debug/snippets")
def debug_snippets(req: ChatRequest):
    """Debug endpoint to see what snippets are retrieved for a query."""
    snippets = retrieve_snippets(req.message)
    return {"query": req.message, "snippets": snippets}


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    snippets = retrieve_snippets(req.message)
    kb_text = "\n\n".join(snippets)

    print(f"\n=== Chat Request ===")
    print(f"User question: {req.message}")
    print(f"Retrieved {len(snippets)} snippets")
    for i, snippet in enumerate(snippets, 1):
        print(f"Snippet {i}: {snippet[:100]}...")

    system_prefix = (
        "You are Sovra AI, a private in-car assistant running locally in the vehicle. "
        "Use the VEHICLE KNOWLEDGE below when it is relevant to the driver's question. "
        "If the issue may affect safety, advise checking the owner manual or contacting a service center.\n\n"
        f"VEHICLE KNOWLEDGE:\n{kb_text}\n\n"
        "Guidelines:\n"
        "- Answer clearly and briefly, like an in-car assistant speaking to a driver.\n"
        "- Focus on practical steps.\n"
        "- Do not mention that you are using a knowledge base.\n\n"
    )

    payload = {
        "prompt": system_prefix + f"Driver question: {req.message}\nAssistant:",
        "n_predict": 256,
    }

    print(f"Full prompt length: {len(payload['prompt'])} chars")
    print(f"=== End Debug ===\n")

    try:
        r = requests.post(f"{LLAMA_SERVER_URL}/completion",
                          json=payload, timeout=120)
        r.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    data = r.json()
    content = data.get("content") or data.get("generation") or str(data)
    return ChatResponse(reply=content)
