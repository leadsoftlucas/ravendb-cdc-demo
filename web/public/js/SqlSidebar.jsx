function SqlSidebar() {
  const { schema, schemaError, selectedTable, openTable } = useSql();

  if (schemaError) {
    return <nav className="sql-sidebar sql-sidebar-loading">Couldn't load tables: {schemaError}</nav>;
  }

  if (!schema) {
    return <nav className="sql-sidebar sql-sidebar-loading">Loading tables…</nav>;
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
            <span>{table.label}</span>
            <span className="sql-sidebar-count">{table.rowCount}</span>
          </button>
        );
      })}
    </nav>
  );
}
