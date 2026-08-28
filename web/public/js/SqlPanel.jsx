function SqlMainContent() {
  const { schema, schemaError, view, selectedTable } = useSql();
  if (schemaError) return <div className="sql-error">Couldn't load the SQL Server schema: {schemaError}</div>;
  if (!schema) return <div className="sql-loading">Loading schema…</div>;
  if (view === "list") return <SqlTableView table={selectedTable} />;
  return <SqlRecordDetail />;
}

function SqlPanel() {
  const { status, loading } = useStatus("/api/sql/status");
  const [connectionModalOpen, setConnectionModalOpen] = React.useState(false);

  return (
    <section className="panel panel-sql">
      <SqlProvider>
        <div className="panel-body">
          <div className="panel-heading">
            <svg className="sql-icon" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <ellipse cx="12" cy="5" rx="8" ry="3" fill="#0078d4" />
              <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" fill="none" stroke="#0078d4" strokeWidth="2" />
              <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" fill="none" stroke="#0078d4" strokeWidth="2" />
            </svg>
            <h2>Microsoft SQL Server</h2>
            <button
              type="button"
              className="panel-settings-button"
              title="Configure SQL Server connection"
              onClick={() => setConnectionModalOpen(true)}
            >
              ⚙
            </button>
            <div className="panel-heading-actions">
              <CdcCaptureToggle />
              <ResetSqlDataButton />
            </div>
          </div>

          {connectionModalOpen && (
            <SqlConnectionModal onClose={() => setConnectionModalOpen(false)} onChanged={() => window.location.reload()} />
          )}

          <SqlContextPanel />

          <div className="sql-body">
            <SqlSidebar />
            <div className="sql-main">
              <SqlMainContent />
            </div>
          </div>
        </div>
      </SqlProvider>

      <PanelFooter status={status} loading={loading} />
    </section>
  );
}
