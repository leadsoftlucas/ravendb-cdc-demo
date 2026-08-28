// Backs the "configure connection" modal on the RavenDB panel: read the
// current connection settings, and switch the whole app to a different
// RavenDB server/database at runtime — optionally provisioning the entire
// environment against it (database, CDC Sink, GenAI/Embeddings tasks, SQL
// ETL, AI Agent, dashboard index, and — if an API key is supplied — the AI
// connection strings themselves), for pointing this app at a brand new
// remote RavenDB server.

const { getRavenConnectionConfig, setRavenConnectionConfig, getAiConnectionStringNames } = require("../lib/ravenConnectionState");
const { provisionRavenEnvironment } = require("../lib/ravenBootstrap");
const { getRavenStatus } = require("./ravenStatus");

function getConnectionInfo() {
  const { url, database, environment } = getRavenConnectionConfig();
  const { aiConnectionStringName, embeddingsConnectionStringName } = getAiConnectionStringNames();
  return { url, database, environment, aiConnectionStringName, embeddingsConnectionStringName };
}

async function updateConnection(body) {
  const url = (body.url || "").trim().replace(/\/$/, "");
  const database = (body.database || "").trim();

  if (!url) throw Object.assign(new Error("URL is required."), { status: 400 });
  if (!database) throw Object.assign(new Error("Database name is required."), { status: 400 });

  let provisioning = null;
  if (body.provision) {
    provisioning = await provisionRavenEnvironment({
      url,
      database,
      environment: body.environment,
      apiKey: body.openAiApiKey || null,
      chatModel: body.chatModel || null,
      embeddingModel: body.embeddingModel || null,
    });
  } else {
    setRavenConnectionConfig({ url, database, environment: body.environment });
  }

  return { ok: true, connection: getConnectionInfo(), provisioning, status: await getRavenStatus() };
}

module.exports = { getConnectionInfo, updateConnection };
