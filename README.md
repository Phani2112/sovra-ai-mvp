# Sovra AI — Private Embedded Intelligence MVP

Sovra AI is a **local, embedded AI assistant** prototype for automotive use cases.  
It runs a quantized LLM via **llama.cpp** on-device and exposes a simple web chat demo and a small automotive knowledge base.

The goal of this MVP is to prove:

- The AI runs **locally**, without any cloud dependency.
- It can answer **automotive, domain-specific questions**.
- It is **private by design**, user data does not leave the device.

---

## 1. Architecture Overview

Layers:

1. **Model server (llama.cpp)**
   - `llama-server.exe` built from the `llama.cpp` repo.
   - Loads a quantized GGUF model (Qwen2.5‑7B‑Instruct Q4_K_M).
   - Serves REST APIs and a web UI on `http://127.0.0.1:8080`.

2. **Backend (FastAPI)**
   - Python FastAPI app on `http://127.0.0.1:8000`.
   - `/api/chat` endpoint accepts user messages, retrieves relevant snippets from `kb.json`, builds a prompt, and forwards it to `llama-server`’s completion endpoint.

3. **Frontend (Static HTML)**
   - `index.html`: landing page.
   - `chat.html`: chat UI that calls `/api/chat`.

4. **Local Automotive Knowledge Base**
   - `kb.json`: owner-manual-style snippets for phone pairing, lane assist, tire pressure, EV efficiency, etc.
   - `retriever.py`: simple keyword matching over `kb.json`.

---

## 2. Prerequisites

- Windows 10/11 machine (laptop demo).
- Git.
- CMake and Visual Studio C++ Build Tools (for `llama.cpp`).
- Python 3.10+.
- ~8 GB free disk and enough RAM for a 4–5 GB quantized model (Q4_K_M).

---

## 3. One-Time Setup

### 3.1 Clone this repo

```bash
git clone https://github.com/Phani2112/sovra-ai-mvp.git sovra-ai-mvp
cd sovra-ai-mvp
```

### 3.2 Get `llama.cpp` (external dependency)

This repository does **not** include the llama.cpp source.  
Clone the official llama.cpp repository next to the app:

```bash
git clone https://github.com/ggml-org/llama.cpp
```

You should now have:

```text
sovra-ai-mvp/
  llama.cpp/
  app/
  docs/
  ...
```

### 3.3 Build `llama.cpp` server (CPU-only)

```powershell
cd .\llama.cpp
cmake -B build -DGGML_CUDA=OFF
cmake --build build --config Release -t llama-server
```

`llama-server.exe` will be located under `llama.cpp\build\bin\Release`.

### 3.4 Download model

Download a quantized Qwen2.5‑7B‑Instruct GGUF, for example:

- `Qwen2.5-7B-Instruct-Q4_K_M.gguf`

Place it in:

```text
models/Qwen2.5-7B-Instruct-Q4_K_M.gguf
```

### 3.5 Set up Python backend

```powershell
cd F:\sovra-ai-mvp\app\backend
python -m venv venv
.\venv\Scripts\activate
pip install fastapi uvicorn requests
```

---

## 4. Running the Demo

You need **three things running**: model server, backend, and frontend.

### 4.1 Start llama.cpp model server

```powershell
cd F:\sovra-ai-mvp\llama.cpp
.\build\bin\Release\llama-server.exe -m ..\models\Qwen2.5-7B-Instruct-Q4_K_M.gguf -c 2048
```

You should see logs including: “server is listening on http://127.0.0.1:8080”.

### 4.2 Start FastAPI backend

```powershell
cd F:\sovra-ai-mvp\app\backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

Check health:

```powershell
curl http://127.0.0.1:8000/health

You should see: {"status":"ok"}



### 4.3 Open frontend

Open `app\frontend\index.html` or `app\frontend\chat.html` directly in the browser.

- `index.html` explains Sovra AI.
- `chat.html` calls `http://127.0.0.1:8000/api/chat`.

Example questions:

- “How do I enable lane assist?”
- “My tire pressure warning is on. What should I do?”
- “How can I improve battery efficiency in an electric vehicle?”

---

## 5. Files of Interest

- `llama.cpp/` — upstream inference engine.
- `models/Qwen2.5-7B-Instruct-Q4_K_M.gguf` — local GGUF model.
- `app/backend/main.py` — FastAPI app, `/api/chat` and CORS config.
- `app/backend/kb.json` — automotive knowledge base.
- `app/backend/retriever.py` — simple retrieval.
- `app/frontend/index.html` — landing page.
- `app/frontend/chat.html` — demo chat UI.

---

## 6. Extensibility

- Swap in other GGUF models by changing the `-m` path.
- Extend `kb.json` with OEM‑specific manuals.
- Replace keyword retrieval with embeddings and vector search by calling llama.cpp’s embeddings API.
- Integrate into head‑unit or embedded hardware where llama.cpp already runs efficiently on CPUs and smaller GPUs.
```
