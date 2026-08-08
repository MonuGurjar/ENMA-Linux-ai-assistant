# Problem Statement & System Requirements

## Project: VOID — Intelligent Linux AI Assistant
**Document Status:** Draft / Proposal  
**Target Platform:** Linux Desktop  

---

## 1. Problem Statement

### 1.1 Context & Background
As modern operating systems grow in complexity, Large Language Models (LLMs) offer a powerful paradigm for simplifying human-computer interaction through natural language. In Linux desktop environments, command-line interfaces (CLI) provide immense power and flexibility, but present a steep learning curve for non-expert users and require repetitive manual operations even for experienced developers.

### 1.2 The Problem
Existing AI desktop assistants and command-line tools suffer from three critical drawbacks:
1. **Data Privacy & Cloud Egress Risks:** Most commercial AI tools transmit system logs, bash history, local file metadata, and user prompts to remote cloud servers, violating privacy boundaries for security-sensitive users.
2. **Unsafe Autonomous System Execution:** Unconstrained AI agents can generate syntactically plausible but destructive terminal commands (e.g., recursive file deletion, unverified privilege escalation, system service modification) without mandatory human confirmation guardrails.
3. **Black-Box Automation vs. User Learning:** Existing automated shell scripts replace user understanding rather than fostering Linux literacy, failing to explain command syntax or system mechanics prior to execution.

### 1.3 Research Objective & Solution
To resolve these issues, **VOID** is designed as a local-first, privacy-focused intelligent assistant for Linux desktop environments. VOID bridges local LLM inference engines (e.g., Ollama, LM Studio) with a sandboxed Python FastAPI backend and a Tauri v2 desktop shell. It achieves offline natural language system command translation, transparent pre-execution command explanations, strict human-in-the-loop confirmation gates, and real-time hardware telemetry.

---

## 2. Functional Requirements (FRs)

Functional Requirements define the specific capabilities and behaviors the system **must execute**.

| Req ID | Category | Requirement Description | Priority |
|---|---|---|---|
| **FR-1.1** | **Conversational AI** | The system shall support multi-turn natural language conversations with streaming Markdown responses and syntax-highlighted code blocks. | **Critical** |
| **FR-1.2** | **Session Management** | The system shall persist conversation history locally in SQLite with search, rename, and delete capabilities. | **High** |
| **FR-2.1** | **Local LLM Integration** | The system shall interface with local inference providers (Ollama, LM Studio) and generic OpenAI-compatible HTTP endpoints. | **Critical** |
| **FR-2.2** | **Model Hot-Swapping** | The system shall allow users to dynamically switch providers and LLM models from the UI header without application restarts. | **High** |
| **FR-3.1** | **Natural Language to CLI** | The backend orchestrator shall parse user prompts into structured tool calls and executable bash commands. | **Critical** |
| **FR-3.2** | **Pre-Execution Explanation** | The system shall display a plain-language summary explaining what a command does before presenting execution controls. | **High** |
| **FR-3.3** | **Human-in-the-Loop Gate** | High-risk or destructive actions (file deletion, `sudo` escalation, package removal) shall require explicit user click/keypress confirmation before running. | **Critical** |
| **FR-3.4** | **Execution Output Capture** | The system shall capture process `stdout`, `stderr`, and exit codes from invoked commands and render them in the chat thread. | **High** |
| **FR-3.5** | **Web Search & Retrieval** | The system shall allow optional, user-initiated web search to fetch online documentation or external reference materials when local context is insufficient. | **Medium** |
| **FR-4.1** | **Document Understanding** | The system shall extract text from local `.pdf`, `.docx`, `.txt`, `.md`, `.json`, `.csv`, and source code files. | **Medium** |
| **FR-4.2** | **Local RAG Search** | The system shall index document chunks into a local vector store for semantic search and context-augmented answer generation. | **Medium** |
| **FR-5.1** | **System Telemetry** | The backend shall poll real-time system metrics (CPU, RAM, GPU/VRAM, Disk, active processes) and display live telemetry in the UI sidebar. | **Medium** |
| **FR-6.1** | **Offline Voice Subsystem** | The system shall perform offline Speech-to-Text (Faster Whisper) and Text-to-Speech (Piper TTS) for hands-free interaction. | **Low** |

---

## 3. Non-Functional Requirements (NFRs)

Non-Functional Requirements define the operational quality, security, and performance standards of the system.

| Req ID | Quality Attribute | Non-Functional Requirement Description | Target Metric / Standard |
|---|---|---|---|
| **NFR-1.1** | **Security & Privacy** | **Zero Unauthorized Cloud Egress:** The application shall not transmit any user prompts, file data, or system logs outside the host machine unless the user explicitly enables Web Search (FR-3.5). | **100% Local Default** |
| **NFR-1.2** | **Security & Privacy** | **Air-Gapped Operation:** Core features (chat, command translation, document RAG, voice STT/TTS) must function completely offline without internet access. | **100% Offline Capable** |
| **NFR-1.3** | **Security & Privacy** | **Strict Loopback IPC:** Inter-process communication between Tauri frontend and FastAPI backend must be bound strictly to loopback interface. | `127.0.0.1` **Only** |
| **NFR-1.4** | **Security & Privacy** | **Command Injection Defense:** User parameters passed to shell tools must be sanitized against command injection before subprocess invocation. | **Zero Vulnerability** |
| **NFR-2.1** | **Performance** | **Interface Startup Latency:** The desktop application shell shall launch and become interactive on standard SSD storage. | **< 2.0 seconds** |
| **NFR-2.2** | **Performance** | **Local IPC Latency:** HTTP/WebSocket response latency between desktop webview and Python backend. | **< 15 ms** |
| **NFR-2.3** | **Performance** | **Tool Launch Latency:** Terminal command execution initiation following user confirmation. | **< 500 ms** |
| **NFR-2.4** | **System Efficiency** | **Backend Memory Overhead:** Background Python backend RSS memory consumption (excluding LLM weights in Ollama/LM Studio). | **< 250 MB RAM** |
| **NFR-3.1** | **Reliability** | **Provider Fault Tolerance:** If local LLM engine crashes, UI shall show non-blocking reconnection alert without crashing app. | **Graceful Handling** |
| **NFR-3.2** | **Reliability** | **Database Transaction Safety:** Conversation write operations must use atomic SQLite transactions to prevent database corruption. | **ACID Compliance** |
| **NFR-3.3** | **Usability** | **Keyboard Navigation:** All primary controls, command palette search (`Ctrl+K`), and confirmation dialogs shall be keyboard navigable. | **100% Operable** |
| **NFR-3.4** | **Accessibility** | **Visual Contrast Standards:** User interface styling and color combinations must meet contrast standards in dark/light modes. | **WCAG 2.1 AA** |
