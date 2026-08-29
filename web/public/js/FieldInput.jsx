function FieldInput({ column, value, onChange }) {
  const { t } = useI18n();
  const [lookupOptions, setLookupOptions] = React.useState(null);

  React.useEffect(() => {
    if (column.type === "fk") {
      fetch(`/api/sql/lookup/${column.ref}`)
        .then((r) => r.json())
        .then(setLookupOptions)
        .catch(() => setLookupOptions([]));
    }
  }, [column.type, column.ref]);

  if (column.type === "textarea") {
    return (
      <textarea
        className="sql-field sql-field-textarea"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    );
  }

  if (column.type === "select") {
    return (
      <select className="sql-field" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        {(column.nullable || !value) && <option value="">—</option>}
        {column.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (column.type === "fk") {
    return (
      <select
        className="sql-field"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        {(column.nullable || !value) && <option value="">{t("sql.none")}</option>}
        {(lookupOptions || []).map((opt) => (
          <option key={opt.Id} value={opt.Id}>
            {opt.Label}
          </option>
        ))}
      </select>
    );
  }

  if (column.type === "boolean") {
    return (
      <input
        type="checkbox"
        className="sql-field-checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }

  if (column.type === "date") {
    return (
      <input
        type="date"
        className="sql-field"
        value={value ? value.slice(0, 10) : ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (column.type === "datetime") {
    return (
      <input
        type="datetime-local"
        className="sql-field"
        value={value ? value.slice(0, 16) : ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (column.type === "int" || column.type === "decimal") {
    return (
      <input
        type="number"
        className="sql-field"
        step={column.type === "decimal" ? "0.01" : "1"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      />
    );
  }

  return (
    <input type="text" className="sql-field" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
  );
}
