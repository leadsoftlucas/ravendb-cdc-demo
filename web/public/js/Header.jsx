function Header() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <header className="raven-header">
      <div className="raven-header-top">
        <img
          className="raven-logo"
          src="https://ravendb.net/media/2025-02-white-ravendb-logo.png"
          alt="RavenDB"
        />
        <div className="raven-header-text">
          <h1>RavenDB CDC Demo &mdash; Vet Clinic &amp; Shelter</h1>
          <p>
            See how RavenDB's CDC Sink turns a live SQL Server database into searchable,
            AI-enriched documents &mdash; without changing a line of the legacy app.
          </p>
        </div>
        <button
          type="button"
          className="raven-expand-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "Hide details ▴" : "Learn more ▾"}
        </button>
      </div>

      {expanded && (
        <div className="raven-header-details">
          <p>
            The <strong>left panel</strong> reads and writes directly to <strong>SQL Server</strong> &mdash;
            the legacy system of record for a vet clinic that also runs a pet shelter and
            adoption program. It never changes.
          </p>
          <p>
            The <strong>right panel</strong> shows what RavenDB's{" "}
            <a href="https://docs.ravendb.net/7.2/server/ongoing-tasks/cdc-sink/overview" target="_blank" rel="noreferrer">
              CDC Sink
            </a>{" "}
            continuously builds from that same data: denormalized documents, vector search,
            and AI-powered enrichment &mdash; all without touching the SQL Server application.
          </p>
          <p className="raven-header-byline">
            A demo by Lucas Tavares, Technical Solutions Consultant at RavenDB.
          </p>
        </div>
      )}
    </header>
  );
}
