// Single shared SQL Server connection pool for the whole app.
//
// The `mssql` package's top-level `sql.connect()` manages one implicit
// global pool per process — if two independent routes each called
// `sql.connect()` and then `pool.close()` after their own query, they'd
// silently close each other's connection. Using an explicit
// `new sql.ConnectionPool(...)` here, owned by this module and never
// closed between requests, avoids that entirely.

const sql = require("mssql");
const { getSqlConnectionConfig } = require("./lib/sqlConnectionState");

function getSqlConfig() {
  const { host, port, database, user, password } = getSqlConnectionConfig();
  return {
    server: host,
    port,
    database,
    user,
    password,
    options: { trustServerCertificate: true },
    connectionTimeout: 5000,
    requestTimeout: 8000,
  };
}

let poolPromise = null;

function connect() {
  const pool = new sql.ConnectionPool(getSqlConfig());
  pool.on("error", () => {
    poolPromise = null;
  });
  return pool.connect().catch((err) => {
    poolPromise = null;
    throw err;
  });
}

function getPool() {
  if (!poolPromise) poolPromise = connect();
  return poolPromise;
}

// Runs fn(pool) and retries once with a fresh pool if the cached one turned
// out to be closed/broken — cheap insurance against SQL Server restarts,
// idle timeouts, etc. without any manual pool lifecycle management.
async function withPool(fn) {
  try {
    return await fn(await getPool());
  } catch (err) {
    if (/connection is closed|not connected|econnreset|econnrefused/i.test(err.message || "")) {
      poolPromise = null;
      return fn(await getPool());
    }
    throw err;
  }
}

// Called after the connection-settings modal points the app at a different
// SQL Server: drops the cached pool (closing it in the background, ignoring
// errors — the old server may already be unreachable) so the very next
// withPool() call reconnects using the freshly updated config.
async function resetPool() {
  const stale = poolPromise;
  poolPromise = null;
  if (stale) {
    try {
      const pool = await stale;
      await pool.close();
    } catch {
      // old pool was already broken/unreachable — nothing to clean up
    }
  }
}

module.exports = { sql, getSqlConfig, getPool, withPool, resetPool };
