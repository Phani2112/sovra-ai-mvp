# Sovra AI Architecture (MVP)

Browser (index.html / chat.html)
|
| HTTP POST /api/chat
v
FastAPI Backend (main.py, port 8000)

- Parses user message
- retrieve_snippets() from kb.json
- Builds prompt: system instructions + VEHICLE KNOWLEDGE + user question
- HTTP POST to llama.cpp server

          |
          |  HTTP POST /completion (or /v1/completions)
          v

  llama.cpp Server (llama-server.exe, port 8080)

- Loads local GGUF model (Qwen2.5-7B-Instruct-Q4_K_M)
- Generates response tokens
- Returns text completion

          |
          v

  FastAPI Backend

- Wraps LLM response as JSON: {"reply": "..."}
  |
  v
  Browser
- Displays "Sovra:" answer in chat UI
