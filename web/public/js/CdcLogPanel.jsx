// Expands below the SQL Server panel's footer — a live, polling view of the
// raw rows SQL Server's CDC actually writes to its cdc.<table>_CT change
// tables, with a short explanation of what that stream is and how it
// relates to RavenDB's CDC Sink. Purely didactic: nothing here is needed for
// the app to function, it exists to make "what is CDC doing" concrete.

const OP_LABEL_KEYS = {
  insert: "cdcLog.opInsert",
  update: "cdcLog.opUpdate",
  delete: "cdcLog.opDelete",
};

function formatChangeTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function CdcLogPanel() {
  const { t } = useI18n();
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/sql/cdc-log?limit=20");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setData({ rows: [], error: err.message });
      }
    }

    load();
    const id = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="cdc-log-panel">
      <div className="cdc-log-explanation">
        <strong>{t("cdcLog.title")}</strong>
        <p>{t("cdcLog.explanation")}</p>
      </div>

      {!data && <p className="cdc-log-loading">{t("cdcLog.loading")}</p>}
      {data && data.error && <p className="cdc-log-loading">{data.error}</p>}
      {data && !data.error && data.rows.length === 0 && <p className="cdc-log-loading">{t("cdcLog.empty")}</p>}
      {data && !data.error && data.rows.length > 0 && (
        <table className="cdc-log-table">
          <thead>
            <tr>
              <th>{t("cdcLog.colTable")}</th>
              <th>{t("cdcLog.colOperation")}</th>
              <th>{t("cdcLog.colRecord")}</th>
              <th>{t("cdcLog.colWhen")}</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i}>
                <td>{row.table}</td>
                <td>
                  <span className={`cdc-log-op cdc-log-op-${row.operation}`}>{t(OP_LABEL_KEYS[row.operation])}</span>
                </td>
                <td>#{row.recordId}</td>
                <td>{formatChangeTime(row.changeTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
