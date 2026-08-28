// Backs the two admin "reset the demo" buttons on the RavenDB panel:
// - Clear RavenDB: wipes every document/collection (including @-prefixed
//   system ones) and turns off every RavenDB-side toggle, so the portal
//   starts from nothing and the presenter can re-enable CDC Sink -> GenAI ->
//   Embeddings -> the Agent one at a time to show each step's effect live.
// - Reset SQL Server data: restores the original seed rows in SQL Server
//   and turns off CDC Sink, so the next enable triggers a full repopulation
//   of RavenDB from a known-good starting point.

const { getTaskStates, toggleTask } = require("./ravenDashboard");
const { getCollectionsStats, deleteCollectionByQuery } = require("../lib/ravenAdmin");
const { setAgentEnabled } = require("./ravenAgent");
const { resetSqlServerData } = require("../lib/sqlReset");

async function disableTaskByType(type) {
  const tasks = await getTaskStates();
  const task = tasks.find((t) => t.type === type);
  if (task && task.enabled) {
    await toggleTask(task.taskId, task.type, true);
  }
}

async function clearRavenDatabase() {
  await disableTaskByType("CdcSink");
  await disableTaskByType("GenAi");
  await disableTaskByType("EmbeddingsGeneration");
  setAgentEnabled(false);

  const stats = await getCollectionsStats();
  const collectionNames = Object.keys(stats.Collections || {});
  for (const name of collectionNames) {
    await deleteCollectionByQuery(name);
  }

  return { ok: true, collectionsCleared: collectionNames };
}

async function resetSqlData() {
  await disableTaskByType("CdcSink");
  await resetSqlServerData();
  return { ok: true };
}

module.exports = { clearRavenDatabase, resetSqlData };
