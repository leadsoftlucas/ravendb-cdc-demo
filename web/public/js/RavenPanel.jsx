function RavenPanel() {
  const { status, loading } = useStatus("/api/raven/status");
  const [connectionModalOpen, setConnectionModalOpen] = React.useState(false);

  return (
    <section className="panel panel-ravendb">
      <div className="panel-body">
        <div className="panel-heading">
          <img
            className="raven-icon"
            src="https://ravendb.net/media/2025-02-white-ravendb-logo.png"
            alt="RavenDB"
          />
          <h2>Adoption Portal</h2>
          <button
            type="button"
            className="panel-settings-button"
            title="Configure RavenDB connection"
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

        <RavenContextPanel />
        <RavenDashboard />
      </div>
      <PanelFooter status={status} loading={loading} />
    </section>
  );
}
