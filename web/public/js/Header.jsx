function Header() {
  const { t, locale } = useI18n();
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
          <h1>{t("header.title")}</h1>
          <p>{t("header.subtitle")}</p>
        </div>
        <LanguageToggle />
        <button
          type="button"
          className="raven-expand-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? t("header.hideDetails") : t("header.learnMore")}
        </button>
      </div>

      {expanded && (
        <div className="raven-header-details">
          {locale === "pt" ? (
            <React.Fragment>
              <p>
                O <strong>painel da esquerda</strong> lê e escreve diretamente no <strong>SQL Server</strong> —
                o sistema legado de registro de uma clínica veterinária que também mantém um abrigo e um
                programa de adoção. Ele nunca muda.
              </p>
              <p>
                O <strong>painel da direita</strong> mostra o que o{" "}
                <a href="https://docs.ravendb.net/7.2/server/ongoing-tasks/cdc-sink/overview" target="_blank" rel="noreferrer">
                  CDC Sink
                </a>{" "}
                do RavenDB constrói continuamente a partir desses mesmos dados: documentos desnormalizados,
                busca vetorial, e enriquecimento por IA — tudo sem tocar na aplicação do SQL Server.
              </p>
            </React.Fragment>
          ) : (
            <React.Fragment>
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
            </React.Fragment>
          )}
          <p className="raven-header-byline">{t("header.byline")}</p>
        </div>
      )}
    </header>
  );
}
