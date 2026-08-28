// On server startup, idempotently ensures the RavenDB side of the demo is
// fully provisioned: the SQL connection string, the CDC Sink task, and (once
// added) the GenAI task, the Embeddings Generation task, and the AI Agent.
// Safe to call on every boot — each step checks the current DatabaseRecord
// first and only creates what's missing, so re-running never duplicates
// tasks. Never throws past this module: a RavenDB that isn't reachable yet
// (or a feature not licensed) is logged, not fatal to the web app.

const {
  GetDatabaseRecordOperation,
  GetDatabaseNamesOperation,
  CreateDatabaseOperation,
  PutConnectionStringOperation,
  SqlConnectionString,
  AiConnectionString,
  OpenAiSettings,
  AddGenAiOperation,
  UpdateGenAiOperation,
  AddEmbeddingsGenerationOperation,
  UpdateEmbeddingsGenerationOperation,
  StartingPointChangeVector,
  AddEtlOperation,
  UpdateEtlOperation,
  AddOrUpdateAiAgentOperation,
  PutIndexesOperation,
} = require("ravendb");
const { getStore, getRavenConfig } = require("./ravenStore");
const { putCdcSinkTask } = require("./ravenAdmin");
const { CDC_SINK_TASK_NAME, buildCdcSinkConfig } = require("./cdcSinkConfig");
const { GENAI_TASK_NAME, buildGenAiConfig } = require("./genAiConfig");
const { EMBEDDINGS_TASK_NAME, buildEmbeddingsConfig } = require("./embeddingsConfig");
const { SQL_ETL_TASK_NAME, buildSqlEtlConfig } = require("./sqlEtlConfig");
const { AGENT_NAME, buildAgentConfig } = require("./agentConfig");
const { PET_STATS_INDEX_NAME, buildPetStatsIndex } = require("./ravenIndexes");
const { getSqlConnectionConfig } = require("./sqlConnectionState");
const {
  setRavenConnectionConfig,
  getAiConnectionStringNames,
  setAiConnectionStringNames,
} = require("./ravenConnectionState");

const OPENAI_ENDPOINT = "https://api.openai.com/";
const GENAI_CONNECTION_STRING_NAME = "GenAI-Connection";
const EMBEDDINGS_CONNECTION_STRING_NAME = "TextEmbedding-Connection";

const SQL_CONNECTION_STRING_NAME = "CDC_Demo_SqlServer";

function buildSqlServerConnectionString() {
  const { host, port, database, user, password } = getSqlConnectionConfig();
  return `Server=${host},${port};Database=${database};User Id=${user};Password=${password};TrustServerCertificate=True;`;
}

async function ensureSqlConnectionString(store, record) {
  const existing = record.sqlConnectionStrings && record.sqlConnectionStrings[SQL_CONNECTION_STRING_NAME];
  const desiredConnectionString = buildSqlServerConnectionString();

  if (existing && existing.connectionString === desiredConnectionString) {
    console.log(`[raven-bootstrap] SQL connection string "${SQL_CONNECTION_STRING_NAME}" already up to date.`);
    return;
  }

  const cs = new SqlConnectionString();
  cs.name = SQL_CONNECTION_STRING_NAME;
  cs.connectionString = desiredConnectionString;
  cs.factoryName = "Microsoft.Data.SqlClient";

  await store.maintenance.send(new PutConnectionStringOperation(cs));
  console.log(`[raven-bootstrap] SQL connection string "${SQL_CONNECTION_STRING_NAME}" created/updated.`);
}

async function ensureCdcSinkTask(record) {
  const existing = (record.cdcSinks || []).find((t) => t.name === CDC_SINK_TASK_NAME);
  const config = buildCdcSinkConfig(SQL_CONNECTION_STRING_NAME);

  await putCdcSinkTask(config, existing ? existing.taskId : undefined);
  console.log(
    `[raven-bootstrap] CDC Sink task "${CDC_SINK_TASK_NAME}" ${existing ? "updated" : "created"} ` +
      `(Pets + People, ${config.Tables.length} root tables).`
  );
}

async function ensureGenAiTask(store, record) {
  const existing = (record.genAis || []).find((t) => t.name === GENAI_TASK_NAME);
  const { aiConnectionStringName } = getAiConnectionStringNames();
  const config = buildGenAiConfig(aiConnectionStringName);

  if (existing) {
    await store.maintenance.send(new UpdateGenAiOperation(existing.taskId, config, StartingPointChangeVector.DoNotChange));
    console.log(`[raven-bootstrap] GenAI task "${GENAI_TASK_NAME}" updated.`);
  } else {
    // BeginningOfTime (not the default LastDocument) so it enriches pets that
    // already existed before this task was created, not just future changes.
    await store.maintenance.send(new AddGenAiOperation(config, StartingPointChangeVector.BeginningOfTime));
    console.log(`[raven-bootstrap] GenAI task "${GENAI_TASK_NAME}" created.`);
  }
}

async function ensureEmbeddingsTask(store, record) {
  const existing = (record.embeddingsGenerations || []).find((t) => t.name === EMBEDDINGS_TASK_NAME);
  const { embeddingsConnectionStringName } = getAiConnectionStringNames();
  const config = buildEmbeddingsConfig(embeddingsConnectionStringName);

  if (existing) {
    await store.maintenance.send(new UpdateEmbeddingsGenerationOperation(existing.taskId, config));
    console.log(`[raven-bootstrap] Embeddings task "${EMBEDDINGS_TASK_NAME}" updated.`);
  } else {
    await store.maintenance.send(new AddEmbeddingsGenerationOperation(config));
    console.log(`[raven-bootstrap] Embeddings task "${EMBEDDINGS_TASK_NAME}" created.`);
  }
}

async function ensureSqlEtlTask(store, record) {
  const existing = (record.sqlEtls || []).find((t) => t.name === SQL_ETL_TASK_NAME);
  const config = buildSqlEtlConfig(SQL_CONNECTION_STRING_NAME);

  if (existing) {
    await store.maintenance.send(new UpdateEtlOperation(existing.taskId, config));
    console.log(`[raven-bootstrap] SQL ETL task "${SQL_ETL_TASK_NAME}" updated.`);
  } else {
    await store.maintenance.send(new AddEtlOperation(config));
    console.log(`[raven-bootstrap] SQL ETL task "${SQL_ETL_TASK_NAME}" created (AdoptionInterests -> SQL Server).`);
  }
}

async function ensureAgent(store) {
  const { aiConnectionStringName } = getAiConnectionStringNames();
  const config = buildAgentConfig(aiConnectionStringName);
  // AddOrUpdateAiAgentOperation creates the agent on first call and updates
  // it in place on every later call — no existence check needed.
  await store.maintenance.send(new AddOrUpdateAiAgentOperation(config, JSON.parse(config.sampleObject)));
  console.log(`[raven-bootstrap] AI Agent "${AGENT_NAME}" created/updated.`);
}

async function ensureIndexes(store) {
  await store.maintenance.send(new PutIndexesOperation(buildPetStatsIndex()));
  console.log(`[raven-bootstrap] Static index "${PET_STATS_INDEX_NAME}" created/updated.`);
}

// Creates the two OpenAI-backed AI connection strings this demo needs
// (chat, for the GenAI task + Agent; text embeddings, for the Embeddings
// task) directly in the target database, and points ravenConnectionState at
// their names. Plain per-database connection strings, not the "Server Wide
// Connection String, <Name>" ones a human sets up by hand in Studio — since
// we're creating these ourselves, there's no need to match that convention.
async function ensureAiConnectionStrings(store, { apiKey, chatModel, embeddingModel }) {
  const chatCs = new AiConnectionString();
  chatCs.name = GENAI_CONNECTION_STRING_NAME;
  chatCs.identifier = "openai-chat";
  chatCs.modelType = "Chat";
  chatCs.openAiSettings = new OpenAiSettings(apiKey, OPENAI_ENDPOINT, chatModel || "gpt-4o-mini");
  await store.maintenance.send(new PutConnectionStringOperation(chatCs));

  const embeddingsCs = new AiConnectionString();
  embeddingsCs.name = EMBEDDINGS_CONNECTION_STRING_NAME;
  embeddingsCs.identifier = "openai-embeddings";
  embeddingsCs.modelType = "TextEmbeddings";
  embeddingsCs.openAiSettings = new OpenAiSettings(apiKey, OPENAI_ENDPOINT, embeddingModel || "text-embedding-3-small");
  await store.maintenance.send(new PutConnectionStringOperation(embeddingsCs));

  setAiConnectionStringNames({
    aiConnectionStringName: GENAI_CONNECTION_STRING_NAME,
    embeddingsConnectionStringName: EMBEDDINGS_CONNECTION_STRING_NAME,
  });
  console.log("[raven-bootstrap] AI connection strings (chat + embeddings) created/updated.");
}

async function ensureRavenDatabaseExists(store, database) {
  const names = await store.maintenance.server.send(new GetDatabaseNamesOperation(0, 1024));
  if (names.includes(database)) return false;

  await store.maintenance.server.send(new CreateDatabaseOperation({ databaseName: database }));
  console.log(`[raven-bootstrap] RavenDB database "${database}" created.`);
  return true;
}

// The actual provisioning steps, throwing on failure — used both by the
// startup path (bootstrapRaven, which catches and logs) and by the
// "configure connection" modal's provisioning flow (which needs to report
// success/failure back to the browser).
async function runBootstrapSteps(store, database) {
  const record = await store.maintenance.server.send(new GetDatabaseRecordOperation(database));
  await ensureSqlConnectionString(store, record);
  await ensureCdcSinkTask(record);
  await ensureGenAiTask(store, record);
  await ensureEmbeddingsTask(store, record);
  await ensureSqlEtlTask(store, record);
  await ensureAgent(store);
  await ensureIndexes(store);
}

async function bootstrapRaven() {
  const { database } = getRavenConfig();
  const store = getStore();

  try {
    await runBootstrapSteps(store, database);
    console.log("[raven-bootstrap] Done.");
  } catch (err) {
    console.error(`[raven-bootstrap] Skipped/failed: ${err.message}`);
  }
}

// Called when the "configure connection" modal points the app at a
// (possibly brand new) RavenDB server/database: creates the database if it
// doesn't exist yet, optionally creates the AI connection strings from a
// freshly supplied API key, then runs every bootstrap step — so a completely
// empty remote RavenDB ends up with the exact same CDC Sink/GenAI/Embeddings/
// SQL ETL/Agent/index setup as the local dev environment.
async function provisionRavenEnvironment({ url, database, environment, apiKey, chatModel, embeddingModel }) {
  setRavenConnectionConfig({ url, database, environment });
  const store = getStore();

  const databaseCreated = await ensureRavenDatabaseExists(store, database);

  let aiConnectionStringsCreated = false;
  if (apiKey) {
    await ensureAiConnectionStrings(store, { apiKey, chatModel, embeddingModel });
    aiConnectionStringsCreated = true;
  }

  await runBootstrapSteps(store, database);

  return { databaseCreated, aiConnectionStringsCreated };
}

module.exports = { bootstrapRaven, provisionRavenEnvironment, SQL_CONNECTION_STRING_NAME };
