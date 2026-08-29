function PanelFooter({ status, loading, extra }) {
  const { t } = useI18n();

  if (loading && !status) {
    return <div className="panel-footer panel-footer-loading">{t("panelFooter.checking")}</div>;
  }
  if (!status) {
    return <div className="panel-footer panel-footer-loading">{t("panelFooter.noStatus")}</div>;
  }

  return (
    <div className="panel-footer">
      <span className={`status-dot ${status.ok ? "status-ok" : "status-down"}`} aria-hidden="true" />
      <div className="panel-footer-details">
        <div className="panel-footer-row">
          <strong>{status.ok ? t("panelFooter.connected") : t("panelFooter.notConnected")}</strong>
          {status.environment && <span className="panel-footer-tag">{status.environment}</span>}
        </div>
        <div className="panel-footer-row panel-footer-meta">
          {status.host && (
            <span>
              {status.host}:{status.port}
            </span>
          )}
          {status.url && (
            <React.Fragment>
              <span>{status.url}</span>
              <a className="panel-footer-studio-link" href={status.url} target="_blank" rel="noreferrer">
                {t("panelFooter.openStudio")} ↗
              </a>
            </React.Fragment>
          )}
          {status.database && <span>{t("panelFooter.db", { name: status.database })}</span>}
          {typeof status.tableCount === "number" && <span>{t("panelFooter.tables", { count: status.tableCount })}</span>}
          {typeof status.collectionCount === "number" && (
            <span>{t("panelFooter.collections", { count: status.collectionCount })}</span>
          )}
        </div>
        {status.error && <div className="panel-footer-error-msg">{status.error}</div>}
      </div>
      {extra && <div className="panel-footer-extra">{extra}</div>}
    </div>
  );
}
