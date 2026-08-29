function RavenPanel() {
  const { t } = useI18n();
  const { status, loading } = useStatus("/api/raven/status");
  const [connectionModalOpen, setConnectionModalOpen] = React.useState(false);

  return (
    <section className="panel panel-ravendb">
      <div className="panel-heading">
        <img
          className="raven-icon"
          src="https://ravendb.net/media/2025-02-white-ravendb-logo.png"
          alt="RavenDB"
        />
        <h2>{t("raven.panelTitle")}</h2>
        <button
          type="button"
          className="panel-settings-button"
          title={t("raven.connectionSettingsTitle")}
          onClick={() => setConnectionModalOpen(true)}
        >
          ⚙
        </button>
        <div className="panel-heading-actions">
          <RavenTaskToggles />
          <ClearRavenDbButton />
        </div>
      </div>

      {connectionModalOpen && (
        <RavenConnectionModal onClose={() => setConnectionModalOpen(false)} onChanged={() => window.location.reload()} />
      )}

      <div className="panel-body">
        <RavenContextPanel />
        <RavenDashboard />
      </div>
      <PanelFooter status={status} loading={loading} />
    </section>
  );
}
