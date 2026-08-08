# Software Requirements Specification (SRS)

## Project: VOID — Intelligent Linux AI Assistant
**Document Version:** 0.1.0 (Draft)  
**Status:** In Progress / Draft  
**Standard:** ISO/IEC/IEEE 29148 / IEEE 830-1998 Compliant  

---

## Document Control & Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 0.1.0-draft | Active Development | Draft IEEE-compliant SRS specification for VOID project

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document provides a complete, authoritative specification of the functional, non-functional, interface, and security requirements for **VOID — Intelligent Linux AI Assistant**. It serves as the primary technical contract for developers, software architects, system testers, and contributors.

### 1.2 Scope
**VOID** is a local-first, privacy-focused desktop application for Linux operating systems that translates natural language intent into safe, explainable, and executable system commands. 

**In Scope (v1.0):**
- Local desktop application (Tauri v2 shell with React frontend and Python FastAPI backend).
- Offline LLM integration via Ollama, LM Studio, and OpenAI-compatible local endpoints.
- Natural language system tool execution with human-in-the-loop permission verification.
- Real-time Linux system resource monitoring (CPU, RAM, GPU, Disk, Processes).
- Short-term session memory and long-term persistent user knowledge store.
- Document understanding (PDF, DOCX, TXT, Markdown, CSV, JSON, Source Code).
- Local RAG (Retrieval-Augmented Generation) engine backed by a vector database.
- Offline voice input (Speech-to-Text via Faster Whisper) and voice output (Text-to-Speech via Piper).
- Modular plugin SDK for extending system tools and custom workflows.

**Out of Scope (v1.0):**
- Cloud-only SaaS deployment or mandatory online accounts.
- Telemetry, data collection, or remote analytical tracking.
- Autonomous execution of high-risk or destructive system operations without explicit confirmation.
- Non-Linux operating systems (macOS and Windows support postponed to v2.0).

### 1.3 Definitions, Acronyms, and Abbreviations

| Term / Acronym | Definition |
|---|---|
| **SRS** | Software Requirements Specification |
| **LLM** | Large Language Model |
| **IPC** | Inter-Process Communication (Local HTTP/WebSocket communication between Tauri and FastAPI) |
| **RAG** | Retrieval-Augmented Generation |
| **STT / TTS** | Speech-to-Text / Text-to-Speech |
| **Tool Manager** | The backend orchestration module responsible for input sanitization, permission evaluation, and terminal execution |
| **Tauri** | Cross-platform desktop application framework using Rust for native bindings and web view rendering |
| **Ollama** | Local LLM inference engine serving open-source models over HTTP |
| **LM Studio** | Local LLM desktop hosting environment providing an OpenAI-compatible API |

### 1.4 References
1. IEEE Std 830-1998: *IEEE Recommended Practice for Software Requirements Specifications*.
2. ISO/IEC/IEEE 29148:2018: *Systems and software engineering — Life cycle processes — Requirements engineering*.
3. [VOID Vision Document](file:///home/silent-sovereign/Music/VOID-ai-assistant/docs/Vision.md)
4. [VOID Product Requirements Document (PRD)](file:///home/silent-sovereign/Music/VOID-ai-assistant/docs/PRD.md)
5. [VOID System Architecture](file:///home/silent-sovereign/Music/VOID-ai-assistant/docs/System-Architecture.md)
6. [VOID Security Model](file:///home/silent-sovereign/Music/VOID-ai-assistant/docs/Security.md)

### 1.5 Overview
The remainder of this document is organized as follows:
- **Section 2** provides an overall description of the product perspective, user classes, operating environment, and implementation constraints.
- **Section 3** details specific functional requirements organized by core system modules.
- **Section 4** outlines external interface specifications (UI, Hardware, Software, Communication).
- **Section 5** defines non-functional requirements (Performance, Security, Reliability, Usability).
- **Section 6** provides a Requirements Traceability & Verification Matrix.

---

## 2. Overall Description

### 2.1 Product Perspective
VOID operates as a multi-tier local desktop application running entirely within the user's Linux environment.

```
┌─────────────────────────────────────────────────────────────┐
│                    Tauri Desktop Shell                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────┐  │
│  │ Conversation UI  │ │ System Monitor   │ │ Settings UI │  │
│  └──────────────────┘ └──────────────────┘ └─────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Local IPC (HTTP / WS @ 127.0.0.1)
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Python Backend                    │
│  ┌─────────────┐ ┌───────────────┐ ┌──────────────────────┐ │
│  │ Orchestrator│ │ Tool Manager  │ │ SQLite & Vector Store│ │
│  └──────┬──────┘ └───────┬───────┘ └──────────────────────┘ │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │ System Commands
┌─────────▼────────┐ ┌─────▼───────────────┐
│ Local LLM Engine │ │ Linux System Kernel │
│ (Ollama/LM Studio│ │ & Utilities         │
└──────────────────┘ └─────────────────────┘
```

The UI never directly executes operating system commands. All system actions are routed through the backend **Tool Manager**, which validates parameters, evaluates permissions, and prompts the user for explicit confirmation before invocation.

### 2.2 Product Functions
1. **Conversational Interface:** Multi-turn natural language dialog with streaming Markdown, syntax-highlighted code blocks, and searchable history.
2. **Local AI Model Integration:** Provider-agnostic inference connecting to local Ollama, LM Studio, or custom OpenAI-compatible API instances.
3. **Natural Language Terminal Assistant:** Translation of user goals into executable Linux commands with built-in educational explanations.
4. **Human-in-the-Loop Permission Control:** Granular permission system gating destructive operations (file deletion, system configuration edits, package installation).
5. **Document Ingestion & RAG:** Local semantic search and document Q&A over local files and codebases.
6. **System Resource Monitoring:** Real-time metrics streaming for CPU, RAM, GPU, Disk usage, and process health.
7. **Offline Voice Interaction:** Push-to-talk voice transcription and natural speech synthesis without cloud access.
8. **Plugin Infrastructure:** Extensible SDK allowing third-party python/javascript tools and commands to be safely registered.

### 2.3 User Classes and Characteristics
- **Linux Beginners & Students:** Require natural language guidance, clear command explanations before execution, and safety guardrails to avoid breaking the system.
- **Software Engineers & DevOps:** Require fast local execution, codebase indexation (RAG), terminal automation, and custom model selection.
- **Privacy Advocates & System Administrators:** Require 100% offline operation, zero external telemetry, transparent IPC logs, and strict permission controls over root/sudo operations.

### 2.4 Operating Environment
- **Target OS:** Modern Linux Distributions (Ubuntu 22.04+, Debian 12+, Fedora 38+, Arch Linux).
- **Runtime Dependencies:**
  - Linux Kernel 5.15+
  - Glibc 2.31+
  - Python 3.13+ (managed via `uv`)
  - Node.js 20+ & `pnpm` (build time)
  - Rust 1.75+ & Cargo (Tauri build)
- **Local AI Engines:** Ollama (serving ports `11434`) or LM Studio (serving ports `1234`).
- **Hardware Requirements:**
  - Minimum: 4-Core CPU, 8 GB RAM, 5 GB available disk space.
  - Recommended: 8-Core CPU, 16+ GB RAM, Dedicated NVIDIA/AMD/Intel GPU with 8+ GB VRAM for local 7B/8B model inference.

### 2.5 Design and Implementation Constraints
1. **Privacy Mandate:** Zero network requests outside `localhost` unless explicitly triggered by a user-configured Web Search tool.
2. **Execution Safety:** Commands involving file deletion, privilege escalation (`sudo`), system configuration modification, or network changes **must** pause execution for manual user approval.
3. **Resource Bound:** The background backend process must not consume more than 250 MB RAM (excluding LLM weights managed by Ollama/LM Studio).
4. **Monorepo Structure:** Codebase organized into distinct `apps/desktop`, `apps/backend`, and `packages/` to enforce clean separation of concerns.

---

## 3. Specific System Requirements

### 3.1 Functional Requirements

#### Module 1: Conversational AI & Provider Engine
- **FR-1.1: Multi-Turn Conversation Management**
  - The system shall maintain multi-turn chat context per session and persist conversation logs in local SQLite storage.
- **FR-1.2: Streaming Response Rendering**
  - The system shall stream tokens from the selected LLM provider to the desktop UI in real time with Server-Sent Events (SSE) or WebSockets.
- **FR-1.3: Dynamic Provider & Model Hot-Swapping**
  - The system shall allow users to switch between Ollama, LM Studio, and generic OpenAI-compatible local endpoints without restarting the application.
- **FR-1.4: Code & Markdown Formatting**
  - The UI shall render incoming responses with GitHub-Flavored Markdown (GFM), including copyable code snippets with syntax highlighting.

#### Module 2: System Integration & Tool Calling
- **FR-2.1: Natural Language Command Generation**
  - The backend LLM Orchestrator shall translate user intent into structured JSON tool calls (e.g., `execute_terminal_command`, `read_file`, `list_directory`).
- **FR-2.2: Pre-Execution Command Explanation**
  - Before executing any terminal command, the system shall display the exact bash string and a plain-language summary of its effect.
- **FR-2.3: Human-in-the-Loop Safety Gate**
  - Operations classified as `High Risk` (e.g., `rm`, `dd`, `chmod 777`, `systemctl stop`, `apt purge`) shall require explicit click or keypress confirmation from the user prior to execution.
- **FR-2.4: Execution Output Capture**
  - The system shall capture `stdout`, `stderr`, and exit status codes from invoked processes and stream them back to the conversation thread.
- **FR-2.5: User-Initiated Web Search & External Retrieval**
  - The system shall support an optional, user-enabled web search tool to fetch external online documentation or reference materials when local context is insufficient.

#### Module 3: Document Ingestion & RAG Knowledge Base
- **FR-3.1: Document Parsing**
  - The system shall extract plain text from local `.pdf`, `.docx`, `.txt`, `.md`, `.csv`, `.json`, and source code files.
- **FR-3.2: Local Vector Indexing**
  - The system shall chunk ingested documents and compute semantic embeddings using a local embedding model (e.g., `nomic-embed-text`) stored in a local Qdrant/SQLite vector table.
- **FR-3.3: Context-Augmented Generation**
  - When document context is queried, the RAG engine shall retrieve the top-$K$ relevant chunks and inject them into the LLM context window with file path citations.

#### Module 4: Memory System
- **FR-4.1: Short-Term Working Memory**
  - The system shall track active task variables, working directories, and recent shell outputs across the current active session.
- **FR-4.2: Long-Term Preference Store**
  - The system shall allow users to inspect, edit, and delete persistent facts (e.g., preferred text editor, primary shell, favorite package manager) stored in the local SQLite database.

#### Module 5: Real-Time System Monitoring
- **FR-5.1: Hardware Metrics Polling**
  - The backend shall poll CPU usage, memory allocation, GPU utilization/VRAM, disk I/O, and top process consumption at configurable intervals (default: 2000 ms).
- **FR-5.2: Real-time UI Telemetry Widget**
  - The UI right sidebar shall display animated gauges and charts rendering live system metrics.

#### Module 6: Voice Subsystem
- **FR-6.1: Speech-to-Text (STT)**
  - The system shall transcribe user audio input locally using Faster Whisper upon activating Push-to-Talk.
- **FR-6.2: Text-to-Speech (TTS)**
  - The system shall synthesize conversational responses into natural speech audio using local Piper TTS models.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- **Main Shell (Tauri v2 + React 19):**
  - **Left Sidebar:** Searchable conversation history, new chat button, system settings link.
  - **Center Canvas:** Chat message stream, input textarea, model selector header, interactive tool execution confirmation dialogs.
  - **Right Sidebar:** System resource monitor, active document index list, memory inspector.
- **Themes:** Dark Mode default with high-contrast customizable CSS tokens.

```
┌────────────────────────────────────────────────────────────────────────┐
│  [=] VOID Assistant   [ Model: Llama-3.2 (Ollama) ▼ ]     [⚙ Settings] │
├───────────────┬────────────────────────────────────────┬───────────────┤
│ + New Chat    │ User: Find all logs larger than 10MB   │ SYSTEM METRICS│
│               │                                        │ CPU:  [██░] 34%│
│ History:      │ VOID: I found 3 log files matching...  │ RAM:  [███] 62%│
│ - Disk cleanup│ ┌────────────────────────────────────┐ │ GPU:  [█░░] 12%│
│ - Rust setup  │ │ EXECUTION CONFIRMATION REQUIRED    │ │               │
│ - Python logs │ │ Command: find /var/log -size +10M  │ │ INDEXED FILES │
│               │ │ Risk Level: Low (Read-only)        │ │ - docs/PRD.md │
│               │ │ [ Confirm & Execute ]  [ Cancel ]  │ │               │
│               │ └────────────────────────────────────┘ │               │
└───────────────┴────────────────────────────────────────┴───────────────┘
```

### 4.2 Hardware Interfaces
- **Audio Output:** Standard ALSA/PulseAudio/PipeWire sound card interface for TTS playback.
- **Audio Input:** Standard microphone interface for STT voice recording.
- **GPU Accelerator:** Direct access to CUDA/ROCm/Vulkan via local LLM engines (Ollama/LM Studio).

### 4.3 Software Interfaces
- **Backend API (FastAPI):** Internal REST & WebSocket interface listening exclusively on `127.0.0.1:8000`.
- **Database Interface:** SQLite 3 database managed via SQLModel ORM stored at `~/.local/share/void/void.db`.
- **Local AI Provider API:**
  - Ollama REST API (`http://127.0.0.1:11434/api/generate`, `/api/chat`)
  - LM Studio OpenAI API (`http://127.0.0.1:1234/v1/chat/completions`)

### 4.4 Communication Interfaces
- All IPC between the desktop webview and Python backend occurs via encrypted local HTTP/WebSocket protocols bounded strictly to loopback interface `127.0.0.1`.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance Requirements
- **NFR-1.1 (Startup Time):** The desktop UI shall launch and become interactive within **< 2.0 seconds** on standard SSD storage.
- **NFR-1.2 (IPC Latency):** Local HTTP IPC latency between Tauri and FastAPI shall be **< 15 ms**.
- **NFR-1.3 (Tool Launch Latency):** Terminal command initialization shall start within **< 500 ms** after user approval.
- **NFR-1.4 (Resource Overhead):** Background Python service RSS memory footprint shall remain **< 250 MB**.

### 5.2 Security & Safety Requirements
- **NFR-2.1 (Zero External Data Egress):** The application shall not initiate outward internet connectivity unless explicit external tools (e.g., Web Search) are enabled by the user.
- **NFR-2.2 (Sandboxed Command Validation):** All inputs passed to the terminal tool must be sanitized against injection attacks and executed with restricted subprocess permissions.
- **NFR-2.3 (Local Data Encryption):** Stored credentials (API keys if using external providers) must be encrypted using the OS keyring (Secret Service API / KWallet).

### 5.3 Reliability & Availability
- **NFR-3.1 (Graceful Provider Fallback):** If the selected LLM provider crashes or becomes unreachable, the UI shall display a clear reconnect prompt without crashing the desktop application.
- **NFR-3.2 (Atomic Database Operations):** All conversation write operations shall use atomic SQLite transactions to prevent database corruption during ungraceful system shutdowns.

### 5.4 Usability & Accessibility
- **NFR-4.1 (Keyboard Navigation):** All UI elements (sidebar, message input, tool buttons) shall be fully accessible via standard keyboard shortcuts (e.g., `Ctrl+K` command palette, `Tab` focus management).
- **NFR-4.2 (Visual Standards):** Interface contrast ratios must comply with WCAG 2.1 AA standards.

---

## 6. Requirements Traceability & Verification Matrix

| Req ID | Requirement Description | Verification Method | Target Phase |
|---|---|---|---|
| **FR-1.1** | Multi-turn chat persistence | Automated Unit Test | Phase 1 (Done) |
| **FR-1.2** | Real-time token streaming | Integration Test | Phase 1 (Done) |
| **FR-1.3** | Provider hot-swapping | E2E Interface Test | Phase 2 (In Progress) |
| **FR-2.2** | Pre-execution explanation | Integration Test | Phase 2 |
| **FR-2.3** | Destructive action approval gate | Manual / E2E Test | Phase 2 |
| **FR-3.2** | Local document vector indexing | Automated Benchmark | Phase 3 |
| **FR-6.1** | Offline STT transcription | Performance Test | Phase 5 |
| **NFR-1.1** | Startup time < 2.0s | System Benchmark | Phase 12 |
| **NFR-2.1** | Zero external telemetry | Security Audit / Wireshark | Phase 12 |

---
*End of Software Requirements Specification for VOID.*
