const CDC_DOCS = [
  { label: "CDC Sink: Overview", href: "https://docs.ravendb.net/7.2/server/ongoing-tasks/cdc-sink/overview" },
  { label: "CDC Sink for SQL Server", href: "https://docs.ravendb.net/7.2/server/ongoing-tasks/cdc-sink/source-database-setup/sql-server/overview" },
  { label: "Creating a CDC Sink task", href: "https://docs.ravendb.net/7.2/server/ongoing-tasks/cdc-sink/manage-cdc-sink-tasks/create-task" },
  { label: "Document modeling: schema design", href: "https://docs.ravendb.net/7.2/server/ongoing-tasks/cdc-sink/document-modeling/schema-design" },
  { label: "Configuration reference", href: "https://docs.ravendb.net/7.2/server/ongoing-tasks/cdc-sink/manage-cdc-sink-tasks/configuration-reference" },
];

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="raven-footer">
      <div className="raven-footer-docs">
        <span className="raven-footer-label">{t("footer.docsLabel")}</span>
        {CDC_DOCS.map((doc) => (
          <a key={doc.href} href={doc.href} target="_blank" rel="noreferrer">
            {doc.label}
          </a>
        ))}
      </div>

      <div className="raven-footer-links">
        <a
          className="raven-footer-link"
          href="https://github.com/leadsoftlucas/ravendb-cdc-demo"
          target="_blank"
          rel="noreferrer"
        >
          {t("footer.githubRepo")}
        </a>
        <a className="raven-footer-link" href="https://ravendb.net" target="_blank" rel="noreferrer">
          RavenDB.net
        </a>
        <a
          className="raven-footer-author"
          href="https://www.linkedin.com/in/lucasrtavares/"
          target="_blank"
          rel="noreferrer"
        >
          <img className="raven-avatar" src="/img/lucas-tavares.jpg" alt="Lucas Tavares" />
          Lucas Tavares
        </a>
      </div>
    </footer>
  );
}
