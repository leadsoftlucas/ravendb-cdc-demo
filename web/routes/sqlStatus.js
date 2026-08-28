const { withPool } = require("../db");
const { getSqlConnectionConfig } = require("../lib/sqlConnectionState");

async function getSqlStatus() {
  const { host, port, database, environment, password } = getSqlConnectionConfig();

  const base = { host, port, database, environment, ok: false, tableCount: null, error: null };

  if (!password) {
    return { ...base, error: "No SQL Server password configured (see web/.env.example, or use the connection settings button)" };
  }

  try {
    const tableCount = await withPool(async (pool) => {
      // Excludes systranschemas, a CDC bookkeeping table sp_cdc_enable_db creates in dbo.
      const result = await pool.request().query(
        "SELECT COUNT(*) AS TableCount FROM INFORMATION_SCHEMA.TABLES " +
          "WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo' AND TABLE_NAME <> 'systranschemas'"
      );
      return result.recordset[0].TableCount;
    });
    return { ...base, ok: true, tableCount };
  } catch (err) {
    return { ...base, error: err.message };
  }
}

module.exports = { getSqlStatus };
