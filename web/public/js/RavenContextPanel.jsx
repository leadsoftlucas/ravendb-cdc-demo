function RavenContextPanel() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="raven-context">
      <button
        type="button"
        className="raven-context-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="raven-context-summary">
          🐾 The adoption portal — built from just 2 RavenDB collections, not all 9 SQL tables
        </span>
        <span className="raven-context-chevron">{expanded ? "▴" : "▾"}</span>
      </button>

      {expanded && (
        <div className="raven-context-body">
          <p>
            CDC Sink only syncs <strong>Pets</strong> and <strong>People</strong> here — with each pet's medical
            history, vaccinations and adoption applications embedded directly into its document. Staff records
            (employees, veterinarians, the clinic itself) never become RavenDB collections at all: they're
            internal, operational data with no reason to exist in a public adoption app.
          </p>
          <p>
            Two ongoing AI tasks then enrich every rescued pet automatically: a <strong>GenAI task</strong> writes
            an adoption bio and temperament tags from the raw intake notes, and an{" "}
            <strong>Embeddings task</strong> turns that into a searchable vector — powering the natural-language
            search below.
          </p>
          <p>
            The chat is an <strong>AI Agent</strong> that can search pets on your behalf and, once you've
            decided, register your interest. That trip doesn't end here: it flows back into SQL Server through
            an ETL task, and the resulting record flows right back into the pet's document below — a live,
            two-way loop.
          </p>
          <p className="raven-context-hint">
            Use the switches below to turn each piece on or off independently — the sync keeps working even with
            AI turned off, because they're genuinely separate, decoupled steps.
          </p>
        </div>
      )}
    </div>
  );
}
