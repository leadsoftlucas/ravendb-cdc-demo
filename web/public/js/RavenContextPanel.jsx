function RavenContextPanel() {
  const { locale } = useI18n();
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
          {locale === "pt"
            ? "🐾 O portal de adoção — construído a partir de apenas 2 coleções do RavenDB, não das 9 tabelas do SQL"
            : "🐾 The adoption portal — built from just 2 RavenDB collections, not all 9 SQL tables"}
        </span>
        <span className="raven-context-chevron">{expanded ? "▴" : "▾"}</span>
      </button>

      {expanded && (
        <div className="raven-context-body">
          {locale === "pt" ? (
            <React.Fragment>
              <p>
                O CDC Sink só sincroniza <strong>Pets</strong> e <strong>People</strong> aqui — com o histórico
                médico, vacinações e candidaturas de adoção de cada pet embutidos diretamente no documento.
                Registros de funcionários (empregados, veterinários, a própria clínica) nunca viram coleções do
                RavenDB: são dados operacionais internos, sem motivo pra existir num app público de adoção.
              </p>
              <p>
                Duas ongoing tasks de IA então enriquecem automaticamente cada pet resgatado: uma{" "}
                <strong>task de GenAI</strong> escreve uma bio de adoção e tags de temperamento a partir das
                anotações cruas de entrada, e uma <strong>task de Embeddings</strong> transforma isso num vetor
                pesquisável — alimentando a busca em linguagem natural abaixo.
              </p>
              <p>
                O chat é um <strong>AI Agent</strong> que consegue buscar pets em seu nome e, depois que você
                decidir, registrar seu interesse. Essa jornada não termina aqui: ela volta pro SQL Server através
                de uma task de ETL, e o registro resultante volta pro documento do pet logo abaixo — um ciclo
                de mão dupla, ao vivo.
              </p>
              <p className="raven-context-hint">
                Use os interruptores abaixo pra ligar ou desligar cada peça de forma independente — a
                sincronização continua funcionando mesmo com a IA desligada, porque são etapas genuinamente
                separadas e desacopladas.
              </p>
            </React.Fragment>
          ) : (
            <React.Fragment>
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
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}
