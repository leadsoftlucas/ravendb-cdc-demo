function PanelFooter({ status, loading }) {
  if (loading && !status) {
    return <div className="panel-footer panel-footer-loading">Checking connection…</div>;
  }
  if (!status) {
    return <div className="panel-footer panel-footer-loading">No status available</div>;
  }

  return (
    <div className="panel-footer">
      <span className={`status-dot ${status.ok ? "status-ok" : "status-down"}`} aria-hidden="true" />
      <div className="panel-footer-details">
        <div className="panel-footer-row">
          <strong>{status.ok ? "Connected" : "Not connected"}</strong>
          {status.environment && <span className="panel-footer-tag">{status.environment}</span>}
        </div>
        <div className="panel-footer-row panel-footer-meta">
          {status.host && (
            <span>
              {status.host}:{status.port}
            </span>
          )}
          {status.url && <span>{status.url}</span>}
          {status.database && <span>DB: {status.database}</span>}
          {typeof status.tableCount === "number" && <span>{status.tableCount} tables</span>}
          {typeof status.collectionCount === "number" && <span>{status.collectionCount} collections</span>}
        </div>
        {status.error && <div className="panel-footer-error-msg">{status.error}</div>}
      </div>
    </div>
  );
}
