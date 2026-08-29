// Lets a visitor point this demo at their own RavenDB server instead of the
// local one — for running the app against a remote RavenDB. When
// "provision" is checked, the backend creates the database (if missing),
// the CDC Sink task, GenAI/Embeddings tasks, the SQL ETL task, the AI Agent,
// and the dashboard's static index against whatever server is entered here.
// An OpenAI API key is optional: supplying one also creates the two AI
// connection strings (chat + embeddings) needed by GenAI/Embeddings/the
// Agent; leaving it blank keeps whatever AI connection strings are already
// configured on that server (e.g. set up by hand in Studio).

function RavenConnectionModal({ onClose, onChanged }) {
  const { t } = useI18n();
  const [form, setForm] = React.useState({
    url: "",
    database: "",
    environment: "",
    provision: false,
    openAiApiKey: "",
    chatModel: "gpt-4o-mini",
    embeddingModel: "text-embedding-3-small",
  });
  const [loaded, setLoaded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState(null);

  React.useEffect(() => {
    fetch("/api/raven/connection")
      .then((r) => r.json())
      .then((data) => {
        setForm((f) => ({
          ...f,
          url: data.url || "",
          database: data.database || "",
          environment: data.environment || "",
        }));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/raven/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update the connection.");
      setResult(data);
      onChanged && onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="connection-modal-backdrop" onClick={onClose}>
      <div className="connection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="connection-modal-header">
          <h3>{t("ravenModal.title")}</h3>
          <button type="button" className="connection-modal-close" onClick={onClose} aria-label={t("modal.close")}>
            ×
          </button>
        </div>

        {!loaded ? (
          <p className="connection-modal-loading">{t("modal.loading")}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              {t("ravenModal.url")}
              <input type="text" value={form.url} onChange={(e) => set("url", e.target.value)} required />
            </label>
            <label>
              {t("sqlModal.database")}
              <input type="text" value={form.database} onChange={(e) => set("database", e.target.value)} required />
            </label>
            <label>
              {t("ravenModal.environment")} <span className="connection-modal-hint">{t("modal.hintFooter")}</span>
              <input type="text" value={form.environment} onChange={(e) => set("environment", e.target.value)} />
            </label>

            <label className="connection-modal-checkbox">
              <input type="checkbox" checked={form.provision} onChange={(e) => set("provision", e.target.checked)} />
              {t("ravenModal.provisionCheckbox")}
            </label>

            {form.provision && (
              <div className="connection-modal-subsection">
                <label>
                  {t("ravenModal.apiKey")} <span className="connection-modal-hint">{t("ravenModal.apiKeyHint")}</span>
                  <input
                    type="password"
                    value={form.openAiApiKey}
                    onChange={(e) => set("openAiApiKey", e.target.value)}
                    placeholder="sk-…"
                  />
                </label>
                <label>
                  {t("ravenModal.chatModel")}
                  <input type="text" value={form.chatModel} onChange={(e) => set("chatModel", e.target.value)} />
                </label>
                <label>
                  {t("ravenModal.embeddingModel")}
                  <input
                    type="text"
                    value={form.embeddingModel}
                    onChange={(e) => set("embeddingModel", e.target.value)}
                  />
                </label>
              </div>
            )}

            {error && <div className="connection-modal-error">{error}</div>}
            {result && !error && (
              <div className="connection-modal-success">
                {t("ravenModal.connectedTo", { url: result.connection.url, database: result.connection.database })}
                {result.provisioning && (
                  <>
                    {" "}
                    {result.provisioning.databaseCreated
                      ? t("ravenModal.databaseCreated")
                      : t("ravenModal.databaseExisted")}{" "}
                    {result.provisioning.aiConnectionStringsCreated ? t("ravenModal.aiCreated") + " " : ""}
                    {t("ravenModal.provisionedSummary")}
                  </>
                )}
              </div>
            )}

            <div className="connection-modal-actions">
              <button type="button" className="connection-modal-cancel" onClick={onClose} disabled={saving}>
                {t("modal.close")}
              </button>
              <button type="submit" className="connection-modal-save" disabled={saving}>
                {saving ? (form.provision ? t("modal.provisioning") : t("modal.saving")) : t("modal.save")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
