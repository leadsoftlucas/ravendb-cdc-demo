// Holds the RavenDB connection settings and the names of the two AI
// connection strings (GenAI / TextEmbedding), in-memory only — same pattern
// as sqlConnectionState.js. The AI connection string names default to the
// "Server Wide Connection String, <Name>" ones the user configures manually
// in Studio (see ravenBootstrap.js); when the "configure connection" modal
// creates its own (plain-named) connection strings for a fresh RavenDB
// server, it overwrites these names to match.

function fromEnv() {
  return {
    url: (process.env.RAVENDB_URL || "http://127.0.0.1:8725").replace(/\/$/, ""),
    database: process.env.RAVENDB_DATABASE || "CDC-Demo",
    environment: process.env.RAVENDB_ENVIRONMENT || "Local",
  };
}

let current = null;
let aiConnectionStringName = "Server Wide Connection String, GenAI";
let embeddingsConnectionStringName = "Server Wide Connection String, TextEmbedding";

function getRavenConnectionConfig() {
  if (!current) current = fromEnv();
  return current;
}

function setRavenConnectionConfig(partial) {
  current = { ...getRavenConnectionConfig(), ...partial };
  return current;
}

function getAiConnectionStringNames() {
  return { aiConnectionStringName, embeddingsConnectionStringName };
}

function setAiConnectionStringNames(names) {
  if (names.aiConnectionStringName) aiConnectionStringName = names.aiConnectionStringName;
  if (names.embeddingsConnectionStringName) embeddingsConnectionStringName = names.embeddingsConnectionStringName;
  return getAiConnectionStringNames();
}

module.exports = {
  getRavenConnectionConfig,
  setRavenConnectionConfig,
  getAiConnectionStringNames,
  setAiConnectionStringNames,
};
