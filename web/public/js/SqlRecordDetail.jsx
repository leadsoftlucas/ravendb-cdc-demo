function ParentLink({ parent }) {
  const { openRecord } = useSql();
  if (!parent || parent.refId === null) {
    return <span className="sql-field-value sql-field-empty">—</span>;
  }
  return (
    <button type="button" className="sql-parent-link" onClick={() => openRecord(parent.table, parent.refId)}>
      {parent.refLabel} →
    </button>
  );
}

function SqlRecordDetail() {
  const { schema, selectedTable, selectedId, view, backToList, openRecord, refreshAll } = useSql();
  const def = schema ? schema.tables[selectedTable] : null;

  const [row, setRow] = React.useState(null);
  const [parents, setParents] = React.useState([]);
  const [formValues, setFormValues] = React.useState({});
  const [editing, setEditing] = React.useState(view === "new");
  const [loading, setLoading] = React.useState(view !== "new");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState(null);

  React.useEffect(() => {
    setEditing(view === "new");
    setError(null);

    if (view === "new") {
      if (!def) return;
      const defaults = {};
      for (const col of def.columns) {
        if (col.pk) continue;
        if (col.type === "select" && !col.nullable && col.options && col.options.length) {
          defaults[col.name] = col.options[0];
        }
        if (col.type === "boolean") defaults[col.name] = false;
      }
      setRow(null);
      setParents([]);
      setFormValues(defaults);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/sql/tables/${selectedTable}/${selectedId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setRow(data.row);
          setParents(data.parents);
          setFormValues(data.row);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedTable, selectedId, view, def]);

  React.useEffect(() => {
    if (def && def.children.length > 0) {
      setActiveTab(def.children[0].table + def.children[0].fk);
    } else {
      setActiveTab(null);
    }
  }, [def]);

  if (!def) return <div className="sql-loading">Loading…</div>;
  if (loading) return <div className="sql-loading">Loading record…</div>;

  function updateField(name, value) {
    setFormValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (view === "new") {
        const res = await fetch(`/api/sql/tables/${selectedTable}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create record");
        refreshAll();
        openRecord(selectedTable, data.id);
      } else {
        const res = await fetch(`/api/sql/tables/${selectedTable}/${selectedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save record");
        refreshAll();
        setRow(formValues);
        setEditing(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const noun = def.label.replace(/s$/, "").toLowerCase();
    if (!window.confirm(`Delete this ${noun}? This can't be undone.`)) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/sql/tables/${selectedTable}/${selectedId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete record");
      refreshAll();
      backToList();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  function handleCancel() {
    if (view === "new") {
      backToList();
    } else {
      setFormValues(row);
      setEditing(false);
      setError(null);
    }
  }

  const editableColumns = def.columns.filter((c) => !c.pk);

  return (
    <div className="sql-detail">
      <div className="sql-detail-header">
        <button type="button" className="sql-back-link" onClick={backToList}>
          ← Back to {def.label}
        </button>
        {!editing && view !== "new" && (
          <button type="button" className="sql-edit-button" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>

      <h3 className="sql-detail-title">
        {view === "new" ? `New ${def.label.replace(/s$/, "")}` : `${def.label.replace(/s$/, "")} #${selectedId}`}
      </h3>

      {error && <div className="sql-error">{error}</div>}

      <div className="sql-detail-form">
        {editableColumns.map((col) => (
          <React.Fragment key={col.name}>
            <label className="sql-field-label">
              {col.label}
              {!col.nullable && <span className="sql-required">*</span>}
            </label>
            {editing ? (
              <FieldInput column={col} value={formValues[col.name]} onChange={(v) => updateField(col.name, v)} />
            ) : col.type === "fk" ? (
              <ParentLink parent={parents.find((p) => p.column === col.name)} />
            ) : (
              <span className="sql-field-value">{formatCellValue(row[col.name])}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {editing && (
        <div className="sql-detail-actions">
          <button type="button" className="sql-save-button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" className="sql-cancel-button" onClick={handleCancel} disabled={saving}>
            Cancel
          </button>
        </div>
      )}

      {!editing && view !== "new" && (
        <div className="sql-detail-actions">
          <button type="button" className="sql-delete-button" onClick={handleDelete} disabled={saving}>
            Delete
          </button>
        </div>
      )}

      {!editing && view !== "new" && def.children.length > 0 && (
        <div className="sql-tabs">
          <div className="sql-tabs-header">
            {def.children.map((child) => {
              const key = child.table + child.fk;
              return (
                <button
                  key={key}
                  type="button"
                  className={`sql-tab ${activeTab === key ? "sql-tab-active" : ""}`}
                  onClick={() => setActiveTab(key)}
                  title={`Related via ${child.table}.${child.fk}`}
                >
                  {child.label}
                  <span className="sql-tab-source">via {child.fk}</span>
                </button>
              );
            })}
          </div>
          {def.children.map((child) => {
            const key = child.table + child.fk;
            if (key !== activeTab) return null;
            return (
              <SqlTableView key={key} table={child.table} filterColumn={child.fk} filterValue={selectedId} compact />
            );
          })}
        </div>
      )}
    </div>
  );
}
