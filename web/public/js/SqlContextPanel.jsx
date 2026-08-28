function SqlContextPanel() {
  const { schema, openTable } = useSql();
  const [expanded, setExpanded] = React.useState(false);

  const totalRows = schema
    ? Object.values(schema.tables).reduce((sum, t) => sum + (t.rowCount || 0), 0)
    : null;

  return (
    <div className="sql-context">
      <button
        type="button"
        className="sql-context-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="sql-context-summary">
          🐾 Vida Animal Vet Clinic &amp; Shelter — the legacy database behind this demo
          {totalRows !== null && ` (${totalRows} rows across ${schema.order.length} tables)`}
        </span>
        <span className="sql-context-chevron">{expanded ? "▴" : "▾"}</span>
      </button>

      {expanded && (
        <div className="sql-context-body">
          <p>
            This is an ordinary, unglamorous relational database — the kind of system a real vet clinic
            that also runs a pet shelter and adoption program would actually run on. Nothing here was
            designed with RavenDB in mind. That's the point of the demo.
          </p>
          <p>
            <strong>Clinics</strong> employ <strong>staff</strong>, some of whom are licensed{" "}
            <strong>veterinarians</strong>. <strong>Pets</strong> are either owned by a tutor from{" "}
            <strong>people</strong> or came in through the shelter, and build up a history of{" "}
            <strong>medical records</strong> and <strong>vaccinations</strong> over time. Rescued pets can
            go through an <strong>adoption application</strong>, which may become a finalized{" "}
            <strong>adoption</strong> — with or without a pre-adoption checkup.
          </p>
          {schema && (
            <ul className="sql-context-stats">
              {schema.order.map((name) => (
                <li key={name}>
                  <button type="button" className="sql-context-stat-link" onClick={() => openTable(name)}>
                    {schema.tables[name].label}
                  </button>{" "}
                  — {schema.tables[name].rowCount}
                </li>
              ))}
            </ul>
          )}
          <p className="sql-context-hint">
            Use the menu on the left to browse, search, edit, and insert records directly — exactly the
            way the clinic's own front-desk staff would.
          </p>
        </div>
      )}
    </div>
  );
}
