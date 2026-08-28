// Low-level RavenDB REST helpers for the pieces the Node.js client (`ravendb`
// npm package, v7.2.x) doesn't wrap yet — CDC Sink has no typed operation
// class in this client version, so it's driven directly over its REST API
// (documented at docs.ravendb.net/7.2/server/ongoing-tasks/cdc-sink).

const { getRavenConfig } = require("./ravenStore");

async function ravenFetch(path, options = {}) {
  const { url, database } = getRavenConfig();
  const res = await fetch(`${url}/databases/${encodeURIComponent(database)}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (body && (body.Message || body.Error)) || `RavenDB request failed: HTTP ${res.status}`;
    throw new Error(message);
  }
  return body;
}

// Creates a new CDC Sink task, or updates the existing one when existingTaskId is given.
async function putCdcSinkTask(config, existingTaskId) {
  const query = existingTaskId ? `?id=${existingTaskId}` : "";
  return ravenFetch(`/admin/cdc-sink${query}`, { method: "PUT", body: JSON.stringify(config) });
}

// Same admin/tasks/state endpoint every ongoing-task type (including ones
// without a typed client operation, like CdcSink) uses to enable/disable.
async function toggleTaskState(taskId, type, disable) {
  return ravenFetch(`/admin/tasks/state?key=${taskId}&type=${type}&disable=${disable ? "true" : "false"}`, {
    method: "POST",
  });
}

// Used by the "Clear RavenDB" admin action to find every collection
// (including the @-prefixed system ones like @embeddings/Pets, @cdc-states,
// @conversations) so it can wipe them all, not just the demo's own data.
async function getCollectionsStats() {
  return ravenFetch("/collections/stats");
}

// Delete-by-query is async server-side: the DELETE call returns an
// OperationId, and the actual deletion happens in the background. Poll
// /operations/state until it reports a terminal status before moving on,
// so callers can rely on the collection being empty once this resolves.
async function deleteCollectionByQuery(collectionName) {
  const escaped = collectionName.replace(/'/g, "''");
  const query = `from '${escaped}'`;
  // The DELETE /queries endpoint reads its query from the JSON body (like a
  // POST), not from a ?query= string — passing it as a querystring instead
  // leaves the body empty and RavenDB throws EndOfStreamException trying to
  // parse it as JSON.
  const result = await ravenFetch(`/queries?allowStale=true`, { method: "DELETE", body: JSON.stringify({ Query: query }) });
  const operationId = result.OperationId;
  if (operationId === undefined || operationId === null) return result;

  for (let i = 0; i < 60; i++) {
    const state = await ravenFetch(`/operations/state?id=${operationId}`);
    const status = state.Status;
    if (status === "Completed") return state;
    if (status === "Faulted" || status === "Canceled") {
      throw new Error(`Delete of collection "${collectionName}" ${status.toLowerCase()}: ${JSON.stringify(state.Result)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Delete of collection "${collectionName}" did not finish in time.`);
}

module.exports = { ravenFetch, putCdcSinkTask, toggleTaskState, getCollectionsStats, deleteCollectionByQuery };
