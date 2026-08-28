// Backs the "configure connection" modal on the SQL Server panel: read the
// current (password-masked) connection settings, and switch the whole app
// to a different SQL Server at runtime — optionally provisioning the full
// demo schema/seed data/CDC against it first, for pointing this app at a
// brand new remote server.

const { getSqlConnectionConfig, setSqlConnectionConfig } = require("../lib/sqlConnectionState");
const { resetPool } = require("../db");
const { provisionSqlServerEnvironment } = require("../lib/sqlProvision");
const { getSqlStatus } = require("./sqlStatus");

function getConnectionInfo() {
  const { host, port, database, user, environment, password } = getSqlConnectionConfig();
  return { host, port, database, user, environment, hasPassword: Boolean(password) };
}

async function updateConnection(body) {
  const host = (body.host || "").trim();
  const database = (body.database || "").trim();
  const user = (body.user || "").trim();
  const port = Number(body.port) || 1433;

  if (!host) throw Object.assign(new Error("Host is required."), { status: 400 });
  if (!database) throw Object.assign(new Error("Database name is required."), { status: 400 });
  if (!user) throw Object.assign(new Error("User is required."), { status: 400 });

  const config = setSqlConnectionConfig({
    host,
    port,
    database,
    user,
    // Only overwrite the stored password if a new one was actually typed —
    // leaving the field blank in the modal means "keep using the current one".
    password: body.password !== undefined && body.password !== "" ? body.password : getSqlConnectionConfig().password,
    environment: body.environment !== undefined ? body.environment : getSqlConnectionConfig().environment,
  });

  await resetPool();

  let provisioning = null;
  if (body.provision) {
    provisioning = await provisionSqlServerEnvironment(config);
  }

  return { ok: true, connection: getConnectionInfo(), provisioning, status: await getSqlStatus() };
}

module.exports = { getConnectionInfo, updateConnection };
