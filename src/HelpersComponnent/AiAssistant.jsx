import { useEffect, useMemo, useState } from "react";
import { askHotelAI } from "../api/aiApi";
import "./aiAssistant.css";

function createConversationId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `hotel-ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AiAssistant({ hotelName = "" }) {
  const conversationId = useMemo(() => {
    const storageKey = "alqasr-ai-conversation-id";
    const existing = localStorage.getItem(storageKey);

    if (existing) return existing;

    const created = createConversationId();
    localStorage.setItem(storageKey, created);
    return created;
  }, []);

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        hotelName
          ? `Hi! I can help you with ${hotelName}. Ask me about rooms, amenities, availability, or anything about this stay.`
          : "Hi! I’m the Al-Qasr AI assistant. Ask me about our hotels, rooms, availability, and stays.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: hotelName
          ? `Hi! I can help you with ${hotelName}. Ask me about rooms, amenities, availability, or anything about this stay.`
          : "Hi! I’m the Al-Qasr AI assistant. Ask me about our hotels, rooms, availability, and stays.",
      },
    ]);
  }, [hotelName]);

  async function sendQuestion(event) {
    event?.preventDefault();

    const trimmed = question.trim();
    if (!trimmed || loading) return;

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
            <button
              type="button"
              className="ai-assistant-close"
              onClick={() => setOpen(false)}
              aria-label="Close AI assistant"
            >
              ×
            </button>
          </header>

          <div className="ai-assistant-messages">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`ai-assistant-message ai-assistant-message-${message.role}`}
              >
                {message.content}
              </div>
            ))}

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
              disabled={loading}
            />
            <button type="submit" disabled={loading || !question.trim()}>
              {loading ? "..." : "Send"}
            </button>
          </form>
        </section>
      )}
    </>
  );
}
