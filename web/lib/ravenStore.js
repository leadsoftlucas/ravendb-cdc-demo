const { DocumentStore } = require("ravendb");
const { getRavenConnectionConfig } = require("./ravenConnectionState");

// Kept for backward compatibility with call sites that only need the config.
function getRavenConfig() {
  return getRavenConnectionConfig();
}

let store = null;
let storeKey = null;

function keyFor(config) {
  return `${config.url}|${config.database}`;
}

function getStore() {
  const config = getRavenConnectionConfig();
  const key = keyFor(config);
  if (!store || storeKey !== key) {
    if (store) store.dispose();
    store = new DocumentStore(config.url, config.database);
    store.initialize();
    storeKey = key;
  }
  return store;
}

module.exports = { getStore, getRavenConfig };
