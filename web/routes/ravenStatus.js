const { getRavenConnectionConfig } = require("../lib/ravenConnectionState");

async function getRavenStatus() {
  const { url, database, environment } = getRavenConnectionConfig();

  const base = { url, database, environment, ok: false, collectionCount: null, error: null };

  try {
    const res = await fetch(`${url}/databases/${encodeURIComponent(database)}/collections/stats`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      return { ...base, error: `HTTP ${res.status}` };
    }
    const stats = await res.json();
    const collectionCount = stats.Collections ? Object.keys(stats.Collections).length : 0;
    return { ...base, ok: true, collectionCount };
  } catch (err) {
    return { ...base, error: err.message };
  }
}

module.exports = { getRavenStatus };
