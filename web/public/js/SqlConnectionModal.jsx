// Lets a visitor point this demo at their own SQL Server instead of the
// bundled local Docker one — for running the app against a remote/managed
// SQL Server. When "provision" is checked, the backend creates the database
// (if missing), the full schema, the seed data, and enables CDC against
// whatever server is entered here — no Docker/docker exec involved, so it
// works against any reachable SQL Server.

function SqlConnectionModal({ onClose, onChanged }) {
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
          <h3>SQL Server connection</h3>
          <button type="button" className="connection-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {!loaded ? (
          <p className="connection-modal-loading">Loading current settings…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Host
              <input type="text" value={form.host} onChange={(e) => set("host", e.target.value)} required />
            </label>
            <label>
              Port
              <input type="number" value={form.port} onChange={(e) => set("port", e.target.value)} required />
            </label>
            <label>
              Database
              <input type="text" value={form.database} onChange={(e) => set("database", e.target.value)} required />
            </label>
            <label>
              User
              <input type="text" value={form.user} onChange={(e) => set("user", e.target.value)} required />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Leave blank to keep the current password"
              />
            </label>
            <label>
              Environment label <span className="connection-modal-hint">(shown in the footer)</span>
              <input type="text" value={form.environment} onChange={(e) => set("environment", e.target.value)} />
            </label>

            <label className="connection-modal-checkbox">
              <input type="checkbox" checked={form.provision} onChange={(e) => set("provision", e.target.checked)} />
              Provision the full environment on this server (create the database, schema, seed data, and enable CDC)
            </label>

            {error && <div className="connection-modal-error">{error}</div>}
            {result && !error && (
              <div className="connection-modal-success">
                Connected to {result.connection.host}:{result.connection.port}/{result.connection.database}.
                {result.provisioning && (
                  <>
                    {" "}
                    {result.provisioning.databaseCreated ? "Database created. " : "Database already existed. "}
                    Seeded {Object.values(result.provisioning.rowsSeeded).reduce((a, b) => a + b, 0)} rows across{" "}
                    {Object.keys(result.provisioning.rowsSeeded).length} tables.{" "}
                    {result.provisioning.cdc.ok
                      ? "CDC enabled."
                      : `CDC could not be enabled: ${result.provisioning.cdc.error}`}
                  </>
                )}
              </div>
            )}

            <div className="connection-modal-actions">
              <button type="button" className="connection-modal-cancel" onClick={onClose} disabled={saving}>
                Close
              </button>
              <button type="submit" className="connection-modal-save" disabled={saving}>
                {saving ? (form.provision ? "Provisioning… this can take a minute" : "Saving…") : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
