import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Send, Plus, Paperclip, Mic, Brain, ChevronDown, Square } from "lucide-react";

import { WelcomeGrid } from "@/components/layout/WelcomeGrid";
import { useModelSelection } from "@/hooks/useModelSelection";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

function parseMessageParts(content: string): { thinking: string; response: string } {
  if (!content) return { thinking: "", response: "" };

  // 1. Explicit <think>...</think> tags
  if (content.includes("<think>")) {
    const thinkEnd = content.indexOf("</think>");
    if (thinkEnd !== -1) {
      const thinking = content.slice(content.indexOf("<think>") + 7, thinkEnd).trim();
      const response = content.slice(thinkEnd + 8).trim();
      return { thinking, response };
    } else {
      // Currently streaming inside <think> tag
      const thinking = content.slice(content.indexOf("<think>") + 7).trim();
      return { thinking, response: "" };
    }
  }

  // 2. Explicit 🧠 **Thought Process** block
  if (content.includes("🧠 **Thought Process**")) {
    const parts = content.split("---");
    if (parts.length >= 2) {
      const thinking = parts[0]
        .replace(/>\s*🧠\s*\*\*Thought Process\*\*/gi, "")
        .replace(/^>\s*/gm, "")
        .trim();
      const response = parts.slice(1).join("---").trim();
      return { thinking, response };
    }
  }

  // 3. Monologue thinking prefix (e.g. "Okay, the user...", "Let's see...", "I need to...")
  const monologueStartPattern = /^\s*(Okay|Let's|The user|Hmm|Wait|First,|I should|I need|I will|Thinking)/i;
  if (monologueStartPattern.test(content)) {
    const answerMarkerMatch = content.match(/(Hello!|Hi!|Hey!|Welcome|Sure!|Here is|Certainly!|Okay!|\n\n(?=[A-Z0-9]))/i);
    
    if (answerMarkerMatch && answerMarkerMatch.index !== undefined && answerMarkerMatch.index > 5) {
      const thinking = content.slice(0, answerMarkerMatch.index).trim();
      const response = content.slice(answerMarkerMatch.index).trim();
      return { thinking, response };
    } else {
      return { thinking: content.trim(), response: "" };
    }
  }

  return { thinking: "", response: content };
}

function ThinkingAccordion({ thinkingText, isDone }: { thinkingText: string; isDone?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-3.5 rounded-xl border border-white/10 bg-black/40 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-white/5 transition-all select-none cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{isDone ? "Thought Process" : "Thinking..."}</span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {isDone ? `(${thinkingText.length} chars)` : "• live"}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-3.5 py-2.5 text-[11px] font-mono text-muted-foreground/90 border-t border-white/10 bg-black/60 leading-relaxed overflow-x-auto max-h-60 overflow-y-auto inset-3d select-text">
          {thinkingText}
        </div>
      )}
    </div>
  );
}

export function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { provider: activeProvider, selectedModel: activeModel } = useModelSelection();

  const scrollRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (id) {
      if (isSendingRef.current) return;
      fetch(`${API_URL}/conversations/${id}/messages`)
        .then((res) => res.json())
        .then((data: Message[]) => {
          if (!isSendingRef.current) {
            setMessages(data.filter((m) => m.content !== "" || m.role === "user"));
          }
        })
        .catch((err) => console.error("Failed to load messages", err));
    } else {
      if (!isSendingRef.current) {
        setMessages([]);
      }
    }
  }, [id, API_URL]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    isSendingRef.current = false;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (isSendingRef.current) return;
    isSendingRef.current = true;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    const userMsg: Message = { role: "user", content: userMessage, created_at: new Date().toISOString() };
    const assistantMsg: Message = { role: "assistant", content: "", created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      let chatId = id;
      if (!chatId) {
        const createRes = await fetch(`${API_URL}/conversations/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: userMessage.slice(0, 30) + "..." }),
        });
        if (!createRes.ok) throw new Error("Failed to create conversation");
        const chatData = await createRes.json();
        chatId = chatData.id;
        navigate(`/chat/${chatId}`, { replace: true });
      }

      const msgRes = await fetch(`${API_URL}/conversations/${chatId}/messages/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: userMessage,
          model: activeModel,
          provider: activeProvider,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!msgRes.ok) throw new Error("Failed to send message");
      if (!msgRes.body) throw new Error("No response body");

      const reader = msgRes.body.getReader();
      const decoder = new TextDecoder();
      let thinkingAccumulator = "";
      let responseAccumulator = "";
      let sseBuffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

          const dataStr = trimmedLine.replace(/^data:\s*/, "").trim();
          if (dataStr === "[DONE]") break;
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (data.error) throw new Error(data.error);

            if (data.thinking) {
              thinkingAccumulator += data.thinking;
            }
            if (data.content) {
              responseAccumulator += data.content;
            }

            const formattedPayload = thinkingAccumulator
              ? `<think>\n${thinkingAccumulator}\n</think>\n\n${responseAccumulator}`
              : responseAccumulator;

            setMessages((prev) => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1] = {
                role: "assistant",
                content: formattedPayload,
                created_at: new Date().toISOString(),
              };
              return newMsgs;
            });
          } catch (e) {
            console.warn("Failed to parse SSE JSON line:", dataStr, e);
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Response streaming stopped by user");
        return;
      }
      console.error("Failed to send message", err);
      const errMsg = err.message === "Failed to fetch"
        ? "Backend connection failed. Please ensure the FastAPI backend is running via ./start.sh"
        : (err.message || "An error occurred");
      setError(errMsg);
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === "assistant" && !prev[prev.length - 1].content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Escape" && isLoading) {
      handleStop();
    }
  };

  const handleSelectAction = (actionId: string, promptText?: string) => {
    if (promptText) {
      setInput(promptText);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative min-h-0 bg-[#0B0F12]">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
          <WelcomeGrid onSelectAction={handleSelectAction} />
        </div>
      ) : (
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-6 min-h-0 no-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, index) => {
              const { thinking, response } = msg.role === "assistant" ? parseMessageParts(msg.content) : { thinking: "", response: msg.content };

              return (
                <div
                  key={index}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-xl transition-all ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-black font-medium rounded-tr-xs shadow-[0_0_16px_rgba(16,185,129,0.3)]"
                        : "bg-[#12181F] text-foreground rounded-tl-xs border border-emerald-500/20"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-wrap font-semibold text-black">{msg.content}</div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none min-h-6">
                        {msg.content === "" ? (
                          <div className="flex items-center gap-1.5 h-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                          </div>
                        ) : (
                          <>
                            {thinking && (
                              <ThinkingAccordion
                                thinkingText={thinking}
                                isDone={!isLoading || index < messages.length - 1}
                              />
                            )}
                            
                            {response && (
                              <ReactMarkdown
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                  code({ node, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    return match ? (
                                      <div className="relative group/code rounded-xl overflow-hidden my-4 border border-emerald-500/30 bg-[#0B0F12] shadow-inner">
                                        <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-950/40 text-xs text-emerald-400 border-b border-emerald-500/20 font-mono">
                                          <span>{match[1]}</span>
                                        </div>
                                        <pre className="p-4 overflow-x-auto text-xs font-mono text-gray-200 leading-relaxed">
                                          <code className={className} {...props}>
                                            {children}
                                          </code>
                                        </pre>
                                      </div>
                                    ) : (
                                      <code className="bg-emerald-950/60 text-emerald-300 font-mono text-xs px-1.5 py-0.5 rounded border border-emerald-500/30" {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              >
                                {response}
                              </ReactMarkdown>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    {msg.created_at && (
                      <div
                        className={`text-[10px] text-muted-foreground/80 mt-2 ${
                          msg.role === "user" ? "text-right text-black/60" : "text-left"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {error && (
              <div className="flex items-center justify-center p-4">
                <div className="bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl px-4 py-3 text-xs font-semibold flex items-center justify-between w-full max-w-md shadow-lg backdrop-blur-md">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="text-rose-400 hover:text-white transition-colors">
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>
      )}

      {/* Glass Chat Input Bar */}
      <div className="px-4 md:px-8 pb-5 pt-2 shrink-0">
        <div className="max-w-4xl mx-auto relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isLoading) {
                handleStop();
              } else {
                handleSend();
              }
            }}
            className="flex items-center gap-3 w-full glass-input-bar p-2.5 px-5 shadow-2xl border border-[#7CFF9B]/25 focus-within:border-[#7CFF9B]/60 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or give a command..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-400 outline-none px-2 py-1 font-medium"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-[#7CFF9B] hover:bg-white/5 rounded-xl transition-all active:scale-95 cursor-pointer"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-[#7CFF9B] hover:bg-white/5 rounded-xl transition-all active:scale-95 hidden sm:flex cursor-pointer"
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 transition-all active:scale-95 flex items-center gap-1.5 font-bold text-xs cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
                  title="Stop response generation (Esc)"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-400" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7CFF9B] to-[#35D6A0] text-[#060B0E] disabled:opacity-40 transition-all active:scale-95 shadow-[0_0_16px_rgba(124,255,155,0.4)] flex items-center justify-center font-bold cursor-pointer hover:scale-105"
                  title="Send command"
                >
                  <Send className="w-4 h-4 text-[#060B0E]" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
