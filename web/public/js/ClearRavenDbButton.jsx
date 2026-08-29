// Lives in the RavenDB panel's header, next to its own toggles — wipes every
// document/collection (including @-prefixed system ones) and turns off CDC
// Sink/GenAI/Embeddings/the Agent, so a presenter can re-enable them one at a
// time and show each step's effect from a clean slate.

function ClearRavenDbButton() {
  const { t } = useI18n();
  const [busy, setBusy] = React.useState(false);

  async function clearRaven() {
    if (!window.confirm(t("raven.clearConfirm"))) return;
    setBusy(true);
    try {
      const res = await fetch("/api/raven/clear", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("raven.clearFailed"));
      window.location.reload();
    } catch (err) {
      window.alert(t("raven.errorPrefix", { message: err.message }));
      setBusy(false);
    }
  }

  return (
    <button type="button" className="panel-admin-button" disabled={busy} onClick={clearRaven}>
      {busy ? t("raven.clearButtonBusy") : t("raven.clearButton")}
    </button>
  );
}
