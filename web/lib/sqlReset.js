// Restores SQL Server to its pristine seed state, driving the same
// docker cp + sqlcmd steps as scripts/Setup-Database.ps1 (clear -> reimport
// -> reseed identities), but from Node so the web app's "Reset SQL Server
// data" admin button can trigger it without a shell session.

const { execFile } = require("child_process");
const path = require("path");
const { promisify } = require("util");

const { getSqlConnectionConfig } = require("./sqlConnectionState");

const execFileAsync = promisify(execFile);

const REPO_ROOT = path.join(__dirname, "..", "..");
const SQL_DIR = path.join(REPO_ROOT, "sql");
const CSV_DIR = path.join(REPO_ROOT, "data", "csv");
const SQLCMD = "/opt/mssql-tools18/bin/sqlcmd";

function containerName() {
  return process.env.SQL_SERVER_DOCKER_CONTAINER || "sqlserver2022";
}

async function runDocker(args) {
  const { stdout, stderr } = await execFileAsync("docker", args, { timeout: 60000 });
  return { stdout, stderr };
}

async function copyScriptsAndSeedData() {
  const container = containerName();
  await runDocker(["exec", container, "mkdir", "-p", "/tmp/sql", "/tmp/import"]);
  await runDocker(["cp", `${SQL_DIR}${path.sep}.`, `${container}:/tmp/sql`]);
  await runDocker(["cp", `${CSV_DIR}${path.sep}.`, `${container}:/tmp/import`]);
}

async function runSqlScript(fileName) {
  const container = containerName();
  const { user, password } = getSqlConnectionConfig();
  try {
    const { stdout } = await runDocker([
      "exec",
      container,
      SQLCMD,
      "-C",
      "-S",
      "localhost",
      "-U",
      user,
      "-P",
      password,
      "-i",
      `/tmp/sql/${fileName}`,
    ]);
    return stdout;
  } catch (err) {
    const detail = (err.stdout || "") + (err.stderr || "") || err.message;
    throw new Error(`sqlcmd failed running ${fileName}: ${detail}`);
  }
}

// Deletes all rows, re-imports the original CSV seed data, and puts IDENTITY
// counters back in sync with it. Does not touch CDC settings or the schema.
async function resetSqlServerData() {
  await copyScriptsAndSeedData();
  await runSqlScript("06-clear-data.sql");
  await runSqlScript("03-import-data.sql");
  await runSqlScript("07-reseed-identities.sql");
  return { ok: true };
}

module.exports = { resetSqlServerData };
