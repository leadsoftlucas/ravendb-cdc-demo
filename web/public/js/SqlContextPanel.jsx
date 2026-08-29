function SqlContextPanel() {
  const { locale, tTable } = useI18n();
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
          {locale === "pt"
            ? "🐾 Vida Animal Vet Clinic & Shelter — o banco de dados legado por trás desta demo"
            : "🐾 Vida Animal Vet Clinic & Shelter — the legacy database behind this demo"}
          {totalRows !== null &&
            (locale === "pt"
              ? ` (${totalRows} linhas em ${schema.order.length} tabelas)`
              : ` (${totalRows} rows across ${schema.order.length} tables)`)}
        </span>
        <span className="sql-context-chevron">{expanded ? "▴" : "▾"}</span>
      </button>

      {expanded && (
        <div className="sql-context-body">
          {locale === "pt" ? (
            <React.Fragment>
              <p>
                Este é um banco relacional comum, sem glamour nenhum — o tipo de sistema em que uma clínica
                veterinária de verdade, que também mantém um abrigo e um programa de adoção, realmente
                rodaria. Nada aqui foi projetado pensando no RavenDB. Esse é o ponto da demo.
              </p>
              <p>
                <strong>Clínicas</strong> empregam <strong>funcionários</strong>, alguns dos quais são{" "}
                <strong>veterinários</strong> licenciados. <strong>Pets</strong> ou pertencem a um tutor
                em <strong>pessoas</strong>, ou vieram pelo abrigo, e acumulam um histórico de{" "}
                <strong>prontuários médicos</strong> e <strong>vacinações</strong> ao longo do tempo. Pets
                resgatados podem passar por uma <strong>candidatura de adoção</strong>, que pode se tornar
                uma <strong>adoção</strong> finalizada — com ou sem um checkup pré-adoção.
              </p>
            </React.Fragment>
          ) : (
            <React.Fragment>
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
            </React.Fragment>
          )}
          {schema && (
            <ul className="sql-context-stats">
              {schema.order.map((name) => (
                <li key={name}>
                  <button type="button" className="sql-context-stat-link" onClick={() => openTable(name)}>
                    {tTable(name, schema.tables[name].label)}
                  </button>{" "}
                  — {schema.tables[name].rowCount}
                </li>
              ))}
            </ul>
          )}
          <p className="sql-context-hint">
            {locale === "pt"
              ? "Use o menu à esquerda pra navegar, buscar, editar e inserir registros diretamente — exatamente como a recepção da própria clínica faria."
              : "Use the menu on the left to browse, search, edit, and insert records directly — exactly the way the clinic's own front-desk staff would."}
          </p>
        </div>
      )}
    </div>
  );
}
