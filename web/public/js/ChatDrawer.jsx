function getOrCreateConversationId() {
  let id = localStorage.getItem("adoption-chat-id");
  if (!id) {
    id = "visitor-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("adoption-chat-id", id);
  }
  return id;
}

function ChatDrawer({ open, onClose, prefill, onConsumePrefill }) {
  const [conversationId] = React.useState(getOrCreateConversationId);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState(null);
  const listRef = React.useRef(null);

  async function send(text) {
    const messageText = (text !== undefined ? text : input).trim();
    if (!messageText) return;
    setMessages((m) => [...m, { role: "user", text: messageText }]);
    setInput("");
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/raven/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: messageText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setMessages((m) => [...m, { role: "assistant", text: data.reply, tokensUsed: data.tokensUsed }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  React.useEffect(() => {
    if (open && prefill) {
      send(prefill);
      onConsumePrefill();
    }
    // eslint-disable-next-line
  }, [open, prefill]);

  React.useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending]);

  function handleSubmit(e) {
    e.preventDefault();
    send();
  }

  return (
    <div className={`chat-drawer ${open ? "chat-drawer-open" : ""}`}>
      <div className="chat-drawer-header">
        <h3>🐾 Adoption Concierge</h3>
        <button type="button" className="chat-drawer-close" onClick={onClose} aria-label="Close chat">
          ×
        </button>
      </div>

      <div className="chat-drawer-messages" ref={listRef}>
        {messages.length === 0 && (
          <p className="chat-drawer-empty">
            Tell me what you're looking for — size, temperament, energy level — and I'll help you find the
            right pet, and register your interest with the shelter when you're ready.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble chat-bubble-${m.role}`}>
            {m.text}
          </div>
        ))}
        {sending && <div className="chat-bubble chat-bubble-assistant chat-bubble-pending">Thinking…</div>}
      </div>

      {error && <div className="raven-error chat-drawer-error">{error}</div>}

      <form className="chat-drawer-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
