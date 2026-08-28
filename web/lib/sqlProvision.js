// Creates the full SQL Server side of the demo (database, schema, seed data,
// CDC) against ANY reachable SQL Server — Docker, on-prem, Azure SQL, etc. —
// using only a plain network connection (the `mssql` package), never
// docker exec/cp. This is what makes the "configure connection" modal work
// against a remote server: web/lib/sqlReset.js's docker-based approach (used
// by the "Reset SQL Server data" button) only works against the known local
// Docker container, which is fine for that button's job but wouldn't work
// here.

const fs = require("fs");
const path = require("path");
const sql = require("mssql");
const { parseCsv } = require("./csv");
const { SEED_TABLES } = require("./sqlSeedTables");

const SQL_DIR = path.join(__dirname, "..", "..", "sql");
const CSV_DIR = path.join(__dirname, "..", "..", "data", "csv");

const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

function assertSafeIdentifier(name, label) {
  if (!SAFE_IDENTIFIER.test(name)) {
    throw new Error(`${label} "${name}" isn't a safe SQL identifier (letters, digits, underscore only).`);
  }
}

function readSqlFile(fileName) {
  return fs.readFileSync(path.join(SQL_DIR, fileName), "utf8");
}

// Splits a .sql script into batches the same way sqlcmd/SSMS would (on a
// line that's just "GO"), and strips "USE <db>;" lines — our connection is
// already bound to the target database via its own config, and the scripts'
// hardcoded "USE CDC_Demo;" would be wrong for a user-chosen database name.
function toBatches(sqlText) {
  return sqlText
    .replace(/^\s*USE\s+\S+\s*;?\s*$/gim, "")
    .split(/^\s*GO\s*$/im)
    .map((b) => b.trim())
    .filter(Boolean);
}

async function runBatches(pool, sqlText) {
  for (const batch of toBatches(sqlText)) {
    await pool.request().batch(batch);
  }
}

function poolConfig({ host, port, user, password, database }) {
  return {
    server: host,
    port,
    database,
    user,
    password,
    options: { trustServerCertificate: true },
    connectionTimeout: 8000,
    requestTimeout: 30000,
  };
}

async function ensureDatabaseExists(config) {
  assertSafeIdentifier(config.database, "Database name");

  const masterPool = new sql.ConnectionPool(poolConfig({ ...config, database: "master" }));
  await masterPool.connect();
  try {
    const existing = await masterPool
      .request()
      .query(`SELECT DB_ID(N'${config.database}') AS Id`);
    const alreadyExists = existing.recordset[0].Id !== null;
    if (!alreadyExists) {
      await masterPool.request().batch(`CREATE DATABASE [${config.database}]`);
    }
    return !alreadyExists;
  } finally {
    await masterPool.close();
  }
}

async function createSchema(pool) {
  await runBatches(pool, readSqlFile("02-create-schema.sql"));
  await runBatches(pool, readSqlFile("05-portal-etl-schema.sql"));
}

// Bulk-copies one seed CSV directly into its table over the network
// connection (tedious's TDS bulk-load protocol — not server-side BULK
// INSERT), preserving the CSV's explicit IDENTITY values. SET IDENTITY_INSERT
// and the bulk load must run on the exact same underlying connection, which
// a plain pool doesn't guarantee across separate calls — a Transaction pins
// one connection for its whole lifetime, so it's used here purely for that,
// not for rollback semantics.
async function seedTable(pool, tableConfig) {
  const csvPath = path.join(CSV_DIR, tableConfig.csv);
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));

  const table = new sql.Table(`dbo.${tableConfig.table}`);
  table.create = false;
  for (const col of tableConfig.columns) {
    table.columns.add(col.name, col.sqlType, { nullable: col.nullable });
  }
  for (const row of rows) {
    table.rows.add(...tableConfig.columns.map((col) => col.coerce(row[col.name])));
  }

  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    await new sql.Request(transaction).batch(`SET IDENTITY_INSERT dbo.${tableConfig.table} ON`);
    await new sql.Request(transaction).bulk(table);
    await new sql.Request(transaction).batch(`SET IDENTITY_INSERT dbo.${tableConfig.table} OFF`);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback().catch(() => {});
    throw new Error(`Seeding ${tableConfig.table} failed: ${err.message}`);
  }

  return rows.length;
}

async function seedAllTables(pool) {
  const counts = {};
  for (const tableConfig of SEED_TABLES) {
    counts[tableConfig.table] = await seedTable(pool, tableConfig);
  }
  return counts;
}

async function reseedIdentities(pool) {
  await runBatches(pool, readSqlFile("07-reseed-identities.sql"));
}

// Best-effort: enabling CDC needs sysadmin-level permission and SQL Server
// Agent running, which not every reachable SQL Server grants (managed/cloud
// offerings vary). Failing here shouldn't block the rest of provisioning —
// the schema and seed data are still useful on their own, and the error is
// reported back to the caller instead of thrown.
async function enableCdc(pool) {
  try {
    await runBatches(pool, readSqlFile("04-enable-cdc.sql"));
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Orchestrates the whole thing: create the database if missing, create the
// schema, seed the original data, put IDENTITY counters back in sync, then
// best-effort enable CDC. Returns a summary the API route can hand back to
// the browser.
async function provisionSqlServerEnvironment(config) {
  const databaseCreated = await ensureDatabaseExists(config);

  const pool = new sql.ConnectionPool(poolConfig(config));
  await pool.connect();
  try {
    await createSchema(pool);
    const rowsSeeded = await seedAllTables(pool);
    await reseedIdentities(pool);
    const cdc = await enableCdc(pool);
    return { databaseCreated, rowsSeeded, cdc };
  } finally {
    await pool.close();
  }
}

module.exports = { provisionSqlServerEnvironment };
