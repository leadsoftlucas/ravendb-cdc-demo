function SqlTableView({ table, filterColumn, filterValue, compact }) {
  const { t, locale, tTable, tColumn, tSingular, tGender } = useI18n();
  const { schema, openRecord, openNew, getListState, setListState, refreshToken } = useSql();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const def = schema ? schema.tables[table] : null;
  const stateKey = filterColumn ? `${table}:${filterColumn}:${filterValue}` : table;
  const listState = getListState(stateKey);

  const load = React.useCallback(() => {
    if (!def) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", listState.page);
    params.set("pageSize", compact ? 5 : 15);
    if (listState.search) params.set("search", listState.search);
    for (const [col, val] of Object.entries(listState.filters || {})) {
      if (val) params.set(`filter_${col}`, val);
    }
    if (filterColumn) params.set(`filter_${filterColumn}`, filterValue);

    fetch(`/api/sql/tables/${table}?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
          setError(null);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [
    def,
    table,
    listState.page,
    listState.search,
    JSON.stringify(listState.filters),
    filterColumn,
    filterValue,
    compact,
    refreshToken,
  ]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (!def) return <div className="sql-loading">{t("sql.loading")}</div>;

  function updateState(patch) {
    setListState(stateKey, patch);
  }

  const tableLabel = tTable(table, def.label);
  const singularNoun = locale === "pt" ? tSingular(table, def.label.replace(/s$/, "")) : def.label.replace(/s$/, "");
  const newArticle = locale === "pt" ? (tGender(table) === "f" ? "Nova" : "Novo") : "New";

  return (
    <div className={`sql-table-view ${compact ? "sql-table-view-compact" : ""}`}>
      <div className="sql-table-toolbar">
        {def.searchable.length > 0 && (
          <input
            type="search"
            className="sql-search"
            placeholder={t("sql.searchPlaceholder", { label: tableLabel.toLowerCase() })}
            value={listState.search}
            onChange={(e) => updateState({ search: e.target.value, page: 1 })}
          />
        )}
        {def.filters.map((f) => (
          <select
            key={f.column}
            className="sql-filter"
            value={(listState.filters || {})[f.column] || ""}
            onChange={(e) =>
              updateState({ filters: { ...(listState.filters || {}), [f.column]: e.target.value }, page: 1 })
            }
          >
            <option value="">{t("sql.filterAll", { label: tColumn(table, f.column, f.column) })}</option>
            {(f.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ))}
        <button type="button" className="sql-new-button" onClick={() => openNew(table)}>
          {t("sql.newRecord", { article: newArticle, noun: singularNoun })}
        </button>
      </div>

      {error && <div className="sql-error">{error}</div>}
      {loading && !data && <div className="sql-loading">{t("sql.loading")}</div>}

      {data && (
        <React.Fragment>
          <table className="sql-grid">
            <thead>
              <tr>
                {def.listColumns.map((col) => (
                  <th key={col}>{tColumn(table, col, (def.columns.find((c) => c.name === col) || {}).label || col)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row[def.pk]} onClick={() => openRecord(table, row[def.pk])} className="sql-grid-row">
                  {def.listColumns.map((col) => (
                    <td key={col}>{formatCellValue(row[col], t)}</td>
                  ))}
                </tr>
              ))}
              {data.rows.length === 0 && (
                <tr>
                  <td colSpan={def.listColumns.length} className="sql-empty">
                    {t("sql.noRecords")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={(p) => updateState({ page: p })}
          />
        </React.Fragment>
      )}
    </div>
  );
}
