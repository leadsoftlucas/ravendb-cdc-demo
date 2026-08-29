// Lets a visitor point this demo at their own SQL Server instead of the
// bundled local Docker one — for running the app against a remote/managed
// SQL Server. When "provision" is checked, the backend creates the database
// (if missing), the full schema, the seed data, and enables CDC against
// whatever server is entered here — no Docker/docker exec involved, so it
// works against any reachable SQL Server.

function SqlConnectionModal({ onClose, onChanged }) {
  const { t } = useI18n();
  const [form, setForm] = React.useState({
    host: "",
    port: 1433,
    database: "",
    user: "",
    password: "",
    environment: "",
    provision: false,
  });
  const [loaded, setLoaded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState(null);

  React.useEffect(() => {
    fetch("/api/sql/connection")
      .then((r) => r.json())
      .then((data) => {
        setForm((f) => ({
          ...f,
          host: data.host || "",
          port: data.port || 1433,
          database: data.database || "",
          user: data.user || "",
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
      const res = await fetch("/api/sql/connection", {
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
          <h3>{t("sqlModal.title")}</h3>
          <button type="button" className="connection-modal-close" onClick={onClose} aria-label={t("modal.close")}>
            ×
          </button>
        </div>

        {!loaded ? (
          <p className="connection-modal-loading">{t("modal.loading")}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              {t("sqlModal.host")}
              <input type="text" value={form.host} onChange={(e) => set("host", e.target.value)} required />
            </label>
            <label>
              {t("sqlModal.port")}
              <input type="number" value={form.port} onChange={(e) => set("port", e.target.value)} required />
            </label>
            <label>
              {t("sqlModal.database")}
              <input type="text" value={form.database} onChange={(e) => set("database", e.target.value)} required />
            </label>
            <label>
              {t("sqlModal.user")}
              <input type="text" value={form.user} onChange={(e) => set("user", e.target.value)} required />
            </label>
            <label>
              {t("sqlModal.password")}
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={t("sqlModal.passwordPlaceholder")}
              />
            </label>
            <label>
              {t("sqlModal.environment")} <span className="connection-modal-hint">{t("modal.hintFooter")}</span>
              <input type="text" value={form.environment} onChange={(e) => set("environment", e.target.value)} />
            </label>

            <label className="connection-modal-checkbox">
              <input type="checkbox" checked={form.provision} onChange={(e) => set("provision", e.target.checked)} />
              {t("sqlModal.provisionCheckbox")}
            </label>

            {error && <div className="connection-modal-error">{error}</div>}
            {result && !error && (
              <div className="connection-modal-success">
                {t("sqlModal.connectedTo", {
                  host: result.connection.host,
                  port: result.connection.port,
                  database: result.connection.database,
                })}
                {result.provisioning && (
                  <>
                    {" "}
                    {result.provisioning.databaseCreated ? t("sqlModal.databaseCreated") : t("sqlModal.databaseExisted")}{" "}
                    {t("sqlModal.seededSummary", {
                      rows: Object.values(result.provisioning.rowsSeeded).reduce((a, b) => a + b, 0),
                      tables: Object.keys(result.provisioning.rowsSeeded).length,
                    })}{" "}
                    {result.provisioning.cdc.ok
                      ? t("sqlModal.cdcEnabled")
                      : t("sqlModal.cdcFailed", { error: result.provisioning.cdc.error })}
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
