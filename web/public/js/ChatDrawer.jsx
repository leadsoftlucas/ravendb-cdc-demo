// marked + DOMPurify are loaded from CDN (see index.html) — Markdown is
// rendered to HTML and sanitized before being injected, since this renders
// both the AI Agent's replies AND the visitor's own typed message.
function renderMarkdown(text) {
  const html = window.marked.parse(text, { breaks: true });
  return { __html: window.DOMPurify.sanitize(html) };
}

function getOrCreateConversationId() {
  let id = localStorage.getItem("adoption-chat-id");
  if (!id) {
    id = "visitor-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("adoption-chat-id", id);
  }
  return id;
}

function ChatDrawer({ open, onClose, prefill, onConsumePrefill }) {
  const { t } = useI18n();
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

  function handleKeyDown(e) {
    // Enter sends; Shift+Enter inserts a newline — needed to actually type
    // multi-line Markdown (lists, paragraphs) into the box.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending && input.trim()) send();
    }
  }

  return (
    <div className={`chat-drawer ${open ? "chat-drawer-open" : ""}`}>
      <div className="chat-drawer-header">
        <h3>{t("chat.title")}</h3>
        <button type="button" className="chat-drawer-close" onClick={onClose} aria-label={t("chat.close")}>
          ×
        </button>
      </div>

      <div className="chat-drawer-messages" ref={listRef}>
        {messages.length === 0 && <p className="chat-drawer-empty">{t("chat.empty")}</p>}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble chat-bubble-${m.role}`} dangerouslySetInnerHTML={renderMarkdown(m.text)} />
        ))}
        {sending && <div className="chat-bubble chat-bubble-assistant chat-bubble-pending">{t("chat.thinking")}</div>}
      </div>

      {error && <div className="raven-error chat-drawer-error">{error}</div>}

      <form className="chat-drawer-input-row" onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.placeholder")}
          disabled={sending}
          rows={1}
        />
        <button type="submit" disabled={sending || !input.trim()}>
          {t("chat.send")}
        </button>
      </form>
    </div>
  );
}
