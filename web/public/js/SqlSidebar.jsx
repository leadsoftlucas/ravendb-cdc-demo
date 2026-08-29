function SqlSidebar() {
  const { t, tTable } = useI18n();
  const { schema, schemaError, selectedTable, openTable } = useSql();

  if (schemaError) {
    return <nav className="sql-sidebar sql-sidebar-loading">{t("sql.sidebarError", { error: schemaError })}</nav>;
  }

  if (!schema) {
    return <nav className="sql-sidebar sql-sidebar-loading">{t("sql.sidebarLoading")}</nav>;
  }

  return (
    <nav className="sql-sidebar">
      {schema.order.map((name) => {
        const table = schema.tables[name];
        return (
          <button
            key={name}
            type="button"
            className={`sql-sidebar-item ${name === selectedTable ? "sql-sidebar-item-active" : ""}`}
            onClick={() => openTable(name)}
          >
            <span>{tTable(name, table.label)}</span>
            <span className="sql-sidebar-count">{table.rowCount}</span>
          </button>
        );
      })}
    </nav>
  );
}
