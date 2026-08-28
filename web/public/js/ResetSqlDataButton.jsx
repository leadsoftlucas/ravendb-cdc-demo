// Lives in the SQL Server panel's header, next to the CDC capture toggle —
// restores SQL Server's original seed data and turns off CDC Sink, so the
// next CDC Sink enable (on the RavenDB side) triggers a full, clean
// repopulation instead of syncing on top of whatever the demo left behind.

function ResetSqlDataButton() {
  const [busy, setBusy] = React.useState(false);

  async function resetSql() {
    if (
      !window.confirm(
        "This restores SQL Server to its original seed data (undoing anything added or changed during this demo) " +
          "and turns off CDC Sink. Continue?"
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/sql/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset SQL Server data.");
      window.location.reload();
    } catch (err) {
      window.alert(`Error: ${err.message}`);
      setBusy(false);
    }
  }

  return (
    <button type="button" className="panel-admin-button" disabled={busy} onClick={resetSql}>
      {busy ? "Resetting…" : "↺ Reset SQL Server data"}
    </button>
  );
}
