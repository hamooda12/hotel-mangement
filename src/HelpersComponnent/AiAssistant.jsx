import { useEffect, useState } from "react";
import {
  getHotelAIHistory,
  askHotelAI,
  deleteHotelAIHistory,
} from "../api/aiApi";
import "./aiAssistant.css";

function createConversationId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `hotel-ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getConversationStorageKey() {
  const user = getStoredUser();
  const identity = user?.email || user?.userName;

  return identity
    ? `alqasr-ai-conversation-id:${identity}`
    : "alqasr-ai-conversation-id:guest";
}

function getOrCreateConversationId() {
  const storageKey = getConversationStorageKey();
  const existing = localStorage.getItem(storageKey);

  if (existing) return existing;

  const created = createConversationId();
  localStorage.setItem(storageKey, created);
  return created;
}

function getGreeting(hotelName) {
  return {
    role: "assistant",
    content: hotelName
      ? `Hi! I can help you with ${hotelName}. Ask me about rooms, amenities, availability, or anything about this stay.`
      : "Hi! I’m the Al-Qasr AI assistant. Ask me about our hotels, rooms, availability, and stays.",
  };
}

export function AiAssistant({ hotelName = "" }) {
  const [conversationId, setConversationId] = useState(() => getOrCreateConversationId());
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([getGreeting(hotelName)]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setConversationId(getOrCreateConversationId());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken || !conversationId) {
        if (!cancelled) setMessages([getGreeting(hotelName)]);
        return;
      }

      setHistoryLoading(true);

      try {
        const history = await getHotelAIHistory(conversationId);
        if (cancelled) return;

        const persistedMessages = Array.isArray(history)
          ? history
              .filter((message) => message?.content)
              .map((message) => ({
                role: message.role === "USER" ? "user" : "assistant",
                content: message.content,
              }))
          : [];

        setMessages(
          persistedMessages.length > 0
            ? persistedMessages
            : [getGreeting(hotelName)]
        );
      } catch (error) {
        console.error("AI history load error:", error);
        if (!cancelled) setMessages([getGreeting(hotelName)]);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [conversationId, hotelName]);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      setMessages([getGreeting(hotelName)]);
    }
  }, [hotelName]);

  async function sendQuestion(event) {
    event?.preventDefault();

    const trimmed = question.trim();
    if (!trimmed || loading || deleting) return;

    setMessages((current) => [
      ...current,
      { role: "user", content: trimmed },
    ]);
    setQuestion("");
    setLoading(true);

    try {
      const result = await askHotelAI({
        hotelName,
        question: trimmed,
        conversationId,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result?.answer || "I could not generate an answer right now.",
        },
      ]);
    } catch (error) {
      console.error("AI assistant error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error?.response?.data?.message ||
            "Sorry, I could not reach the hotel AI service. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    if (loading || deleting) return;

    const confirmed = window.confirm(
      "Delete this chat history? Your long-term AI memory will not be changed."
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteHotelAIHistory(conversationId);
      setMessages([getGreeting(hotelName)]);
    } catch (error) {
      console.error("AI chat deletion error:", error);
      window.alert(
        error?.response?.data?.message ||
          "I could not delete the chat history. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="ai-assistant-fab"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open Al-Qasr AI assistant"
      >
        <span className="ai-assistant-fab-icon">✦</span>
        <span>Ask AI</span>
      </button>

      {open && (
        <section className="ai-assistant-panel" aria-label="Al-Qasr AI assistant">
          <header className="ai-assistant-header">
            <div>
              <span className="ai-assistant-kicker">✦ AL-QASR AI</span>
              <h2>Hotel Assistant</h2>
              <p>{hotelName ? hotelName : "Your stay companion"}</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                className="ai-assistant-close"
                onClick={clearChat}
                disabled={loading || deleting || historyLoading}
                aria-label="Delete chat history"
                title="Delete chat history"
                style={{ fontSize: 16, opacity: deleting ? 0.5 : 1 }}
              >
                {deleting ? "…" : "🗑"}
              </button>
              <button
                type="button"
                className="ai-assistant-close"
                onClick={() => setOpen(false)}
                aria-label="Close AI assistant"
              >
                ×
              </button>
            </div>
          </header>

          <div className="ai-assistant-messages">
            {historyLoading && messages.length === 1 && messages[0]?.role === "assistant" ? (
              <div className="ai-assistant-message ai-assistant-message-assistant ai-assistant-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`ai-assistant-message ai-assistant-message-${message.role}`}
                >
                  {message.content}
                </div>
              ))
            )}

            {loading && (
              <div className="ai-assistant-message ai-assistant-message-assistant ai-assistant-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

          <form className="ai-assistant-form" onSubmit={sendQuestion}>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about the hotel..."
              disabled={loading || deleting}
            />
            <button
              type="submit"
              disabled={loading || deleting || !question.trim()}
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </section>
      )}
    </>
  );
}
