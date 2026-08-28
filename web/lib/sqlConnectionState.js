// Holds the SQL Server connection settings the rest of the app reads from —
// in-memory only, seeded from web/.env on boot. The "configure connection"
// modal calls setSqlConnectionConfig() at runtime to point the whole app at
// a different server without touching the .env file or restarting the
// process; a restart always falls back to the .env values.

function fromEnv() {
  return {
    host: process.env.SQL_SERVER_HOST || "localhost",
    port: Number(process.env.SQL_SERVER_PORT) || 1433,
    database: process.env.SQL_SERVER_DATABASE || "CDC_Demo",
    user: process.env.SQL_SERVER_USER || "sa",
    password: process.env.SQL_SERVER_PASSWORD || "",
    environment: process.env.SQL_SERVER_ENVIRONMENT || "Docker (localhost)",
  };
}

let current = null;

function getSqlConnectionConfig() {
  if (!current) current = fromEnv();
  return current;
}

function setSqlConnectionConfig(partial) {
  current = { ...getSqlConnectionConfig(), ...partial };
  return current;
}

module.exports = { getSqlConnectionConfig, setSqlConnectionConfig };
