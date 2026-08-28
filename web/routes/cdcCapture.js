const { sql, withPool } = require("../db");
const { getSqlConnectionConfig } = require("../lib/sqlConnectionState");

// The capture job's name follows SQL Server's own convention: cdc.<database>_capture.
function captureJobName(database) {
  return `cdc.${database}_capture`;
}

async function queryCaptureRunning(pool, database) {
  const result = await pool.request().input("jobName", sql.NVarChar, captureJobName(database)).query(`
    SELECT CASE
      WHEN a.run_requested_date IS NOT NULL AND a.stop_execution_date IS NULL THEN 1
      ELSE 0
    END AS IsRunning
    FROM msdb.dbo.sysjobs j
    JOIN msdb.dbo.sysjobactivity a ON a.job_id = j.job_id
      AND a.session_id = (SELECT MAX(session_id) FROM msdb.dbo.syssessions)
    WHERE j.name = @jobName
  `);
  return result.recordset[0] ? Boolean(result.recordset[0].IsRunning) : false;
}

async function getCaptureStatus() {
  const { database, password } = getSqlConnectionConfig();
  if (!password) {
    return { running: false, error: "No SQL Server password configured (see web/.env.example, or use the connection settings button)" };
  }

  try {
    const running = await withPool((pool) => queryCaptureRunning(pool, database));
    return { running, error: null };
  } catch (err) {
    return { running: false, error: err.message };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setCaptureEnabled(enabled) {
  const { database, password } = getSqlConnectionConfig();
  if (!password) {
    return { running: false, error: "No SQL Server password configured (see web/.env.example, or use the connection settings button)" };
  }

  try {
    const running = await withPool(async (pool) => {
      const jobType = enabled ? "start" : "stop";
      await pool.request().query(`EXEC sys.sp_cdc_${jobType}_job @job_type = N'capture';`);

      // msdb.dbo.sysjobactivity lags the sp_cdc_*_job call by a moment, so poll
      // briefly for the state we just requested instead of trusting the first read.
      let isRunning = await queryCaptureRunning(pool, database);
      for (let attempt = 0; attempt < 6 && isRunning !== enabled; attempt++) {
        await sleep(500);
        isRunning = await queryCaptureRunning(pool, database);
      }
      return isRunning;
    });
    return { running, error: null };
  } catch (err) {
    return { running: false, error: err.message };
  }
}

module.exports = { getCaptureStatus, setCaptureEnabled };
