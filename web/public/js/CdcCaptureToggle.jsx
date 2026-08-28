function CdcCaptureToggle() {
  const [running, setRunning] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/sql/cdc-capture");
      const data = await res.json();
      setRunning(data.running);
      setError(data.error);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [load]);

  async function toggle() {
    setPending(true);
    try {
      const res = await fetch("/api/sql/cdc-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !running }),
      });
      const data = await res.json();
      setRunning(data.running);
      setError(data.error);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="cdc-toggle">
      <label className="cdc-toggle-switch">
        <input
          type="checkbox"
          checked={running}
          disabled={loading || pending}
          onChange={toggle}
        />
        <span className="cdc-toggle-track">
          <span className="cdc-toggle-thumb" />
        </span>
      </label>
      <span className="cdc-toggle-label" title="Starts/stops the SQL Server CDC capture job">
        {pending ? "Updating…" : `CDC capture: ${running ? "on" : "off"}`}
      </span>
      {error && <span className="cdc-toggle-error">{error}</span>}
    </div>
  );
}
