<h1 align="center">🌌 VOID — Autonomous Linux AI Assistant</h1>

<p align="center">
  <strong>Privacy-first · Local-first · Arch & Garuda Linux Native</strong><br/>
  An intelligent desktop AI assistant that brings natural language command execution, system control, and real-time hardware telemetry to your Linux desktop.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0--beta-7CFF9B?style=flat-square&logoColor=black" alt="Version" />
  <img src="https://img.shields.io/badge/platform-Garuda%20%7C%20Arch%20Linux-8A2BE2?style=flat-square&logo=archlinux&logoColor=white" alt="Platform" />
  <img src="https://img.shields.io/badge/license-MIT-purple?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/status-Phase%201%20Completed-brightgreen?style=flat-square" alt="Status" />
</p>

---

## 🌌 Vision

> *Build a powerful, privacy-first AI operating companion for Linux that executes terminal operations autonomously, explains system state, and streamlines everyday desktop workflows with complete data sovereignty.*

VOID translates natural language into direct system actions — executing commands via an autonomous Bash execution pipeline, displaying real-time hardware telemetry, and offering an ultra-futuristic dark glassmorphism UI.

### Core Principles

| Principle | Description |
|---|---|
| 🔒 **100% Local & Private** | All AI models run locally via Ollama / vLLM. Zero telemetry. No cloud dependencies. |
| ⚡ **Autonomous Bash Execution** | Direct terminal tool execution (`terminal_execute`) for real-time Linux operating system control. |
| 🛡️ **Garuda & Arch Native** | Native command resolvers for `pacman`, `garuda-update`, `journalctl`, `inxi`, and `xdg-open`. |
| 🎨 **Futuristic UX** | Dark glassmorphism layout (`#070B0E`), glowing neon accents (`#7CFF9B`), and 3-column floating panels. |
| 💬 **Full Chat Control** | Instant "+ New Chat", Recent Chat History list with 1-click delete, and live "Stop Generation" stream control. |

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 💬 Advanced Chat & Stream Control
- **Streaming SSE Engine**: Real-time token streaming with `<think>` accordion parsing.
- **Stop Generation Control**: 1-click **Stop** button and `Esc` key abort for streaming outputs.
- **Chat Management**: "+ New Chat" quick creation, Recent Chat History with deletion, and prompt editing.
- **Repetition Safeguards**: Built-in repetition penalty (`repeat_penalty: 1.2`) and hallucinated token sanitization.

### 🖥️ Linux System Telemetry & Control
- **Autonomous Terminal Tool**: Direct execution of Linux commands without verbose Python tool clutter.
- **Real-Time Telemetry**: Instant CPU, GPU (NVIDIA / Intel), RAM, VRAM, and Storage monitoring (`inxi -b -c 0`).
- **Clean Terminal Output**: Automated ANSI escape sequence stripper for crisp markdown text without unicode boxes.

</td>
<td width="50%">

### 🛡️ Smart Arch / Garuda Resolvers
- **System Upgrades**: Auto-launches interactive terminal updater (`konsole -e garuda-update &` / `sudo pacman -Syu`).
- **Log Inspection**: Resolves `/var/log/syslog` requests directly to `journalctl -n 50 --no-pager`.
- **App & Web Launching**: Maps browser/web requests to `xdg-open` in background.
- **Package Checking**: Checks repository updates via `pacman -Qu`.

### 📚 Upcoming Capabilities *(Roadmap)*
- **Phase 2 — RAG & Documents**: PDF, DOCX, Markdown, and repository code indexing.
- **Phase 3 — Long-Term Memory**: Persistent vector memory for user preferences & facts.
- **Phase 4 — Local Voice Assistant**: STT (Faster Whisper) & TTS (Piper).

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   Vite + React 19 Desktop UI                     │
│  ┌──────────────────┬─────────────────────────┬───────────────┐  │
│  │   Left Sidebar   │   Main AI Workspace     │ Right Sidebar │  │
│  │ • + New Chat     │ • Model Selector        │ • Live Status │  │
│  │ • Navigation     │ • Chat Stream           │ • CPU/GPU/RAM │  │
│  │ • Recent History │ • Stop Stream Control   │   Telemetry   │  │
│  └──────────────────┴─────────────────────────┴───────────────┘  │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ HTTP SSE Stream (Port 8000)
                     ┌───────────▼───────────┐
                     │    FastAPI Backend    │
                     │ ┌───────────────────┐ │
                     │ │ Chat Orchestrator │ │
                     │ ├───────────────────┤ │
                     │ │ Command Resolvers │──── Linux Shell (`terminal_execute`)
                     │ ├───────────────────┤ │
                     │ │ SQLite DB (v1)    │ │
                     │ └───────────────────┘ │
                     └───────────┬───────────┘
                                 │ Local API
                     ┌───────────▼───────────┐
                     │   Ollama Local LLM    │
                     │    (`enma:latest`)    │
                     └───────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 7, Tailwind CSS |
| **Icons & Animations** | Lucide Icons, Framer Motion |
| **Backend Engine** | FastAPI (Python 3.13+), Uvicorn, SQLModel |
| **Database** | SQLite (`void.db`) |
| **Local AI Engine** | Ollama (`enma:latest`, `qwen2.5`, `llama3.2`) / vLLM |
| **Linux Execution** | Async Subprocess Shell (`terminal_execute`) |
| **Package Managers** | pnpm (frontend), uv (Python) |

---

## 🚀 Getting Started

### Prerequisites

- **Garuda Linux**, **Arch Linux**, or any modern Linux distribution
- **Node.js** ≥ 20 & **pnpm**
- **Python** ≥ 3.13 & **uv**
- **Ollama** installed locally (`ollama pull enma:latest` or `ollama pull qwen2.5`)

### Installation & Launch

```bash
# 1. Clone the repository
git clone https://github.com/MonuGurjar/VOID-Linux-ai-assistant.git
cd VOID-Linux-ai-assistant

# 2. Install dependencies
pnpm install

# 3. Start the FastAPI Backend (Port 8000)
cd apps/backend
uv run uvicorn main:app --reload --port 8000

# 4. Start the React Desktop App (in a new terminal)
cd apps/desktop
pnpm dev
```

---

## 🗺️ Roadmap & Progress Status

| Phase | Status | Description |
|---|---|---|
| **Phase 0 — Foundation** | ✅ **Done** | Architecture scaffold, FastAPI backend + React 19 frontend monorepo |
| **Phase 1 — Core Execution & UI** | ✅ **Done** | Dark glassmorphism 3-column UI, "+ New Chat", Recent History, Stop Stream button, `<think>` accordion |
| **Phase 2 — Arch/Garuda Command Resolvers** | ✅ **Done** | Autonomous Bash tool calling, `garuda-update`, `journalctl`, `inxi -b -c 0`, `xdg-open`, ANSI stripper |
| **Phase 3 — Knowledge Engine (RAG)** | 🔄 **Next** | PDF/DOCX document chat, repository indexing, local vector store |
| **Phase 4 — Long-Term Memory** | ⬜ Planned | Vector memory manager for user preferences & facts across sessions |
| **Phase 5 — Local Voice Interface** | ⬜ Planned | Speech-to-Text (Faster-Whisper) & Text-to-Speech (Piper) push-to-talk overlay |
| **Phase 6 — Linux Automation** | ⬜ Planned | Scheduled cron workflows, daily backup & package maintenance routines |
| **Phase 7 — Plugin Platform & MCP** | ⬜ Planned | VOID Plugin SDK & Model Context Protocol (MCP) server integration |

---

## 📄 License

Licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built with 💜 for the Linux community</sub><br/>
  <sub><strong>VOID</strong> — Autonomous Linux AI Assistant</sub>
</p>
