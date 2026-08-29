// Backs the SQL Server panel's "CDC log" — a peek at the raw change rows SQL
// Server's Change Data Capture actually records, straight from the
// cdc.<capture_instance>_CT change tables. This is the exact stream
// RavenDB's CDC Sink polls; showing it directly (rather than only the
// RavenDB-side effect) is the point — it's meant to demystify "what is CDC
// actually doing" for anyone watching a live demo.

const { withPool } = require("../db");

// __$operation values per Microsoft's CDC docs: 1=delete, 2=insert,
// 3=update (before image), 4=update (after image). The before-image rows
// are filtered out below — a log entry per net change reads better than a
// before/after pair for every update.
function operationName(op) {
  if (op === 1) return "delete";
  if (op === 2) return "insert";
  return "update";
}

async function getCdcLog(limit) {
  try {
    const rows = await withPool(async (pool) => {
      const captureResult = await pool.request().query(`
        SELECT capture_instance AS CaptureInstance, OBJECT_NAME(source_object_id) AS SourceTable
        FROM cdc.change_tables
      `);
      const captures = captureResult.recordset;
      if (captures.length === 0) return [];

      const unions = [];
      for (const capture of captures) {
        const instance = capture.CaptureInstance;
        const changeTableName = `${instance}_CT`;

        // Every table in this schema puts its own IDENTITY primary key as
        // the first column, so the first non-metadata column of the change
        // table is always a good, human-readable "which record" value.
        const colResult = await pool.request().query(`
          SELECT TOP 1 COLUMN_NAME
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = 'cdc' AND TABLE_NAME = '${changeTableName}' AND COLUMN_NAME NOT LIKE '\\_\\_$%' ESCAPE '\\'
          ORDER BY ORDINAL_POSITION
        `);
        const pkColumn = colResult.recordset[0] && colResult.recordset[0].COLUMN_NAME;
        if (!pkColumn) continue;

        unions.push(`
          SELECT TOP (${limit}) '${capture.SourceTable}' AS SourceTable, __$operation AS Op,
                 sys.fn_cdc_map_lsn_to_time(__$start_lsn) AS ChangeTime,
                 CAST([${pkColumn}] AS NVARCHAR(50)) AS RecordId,
                 __$start_lsn AS Lsn
          FROM cdc.[${changeTableName}]
          WHERE __$operation <> 3
          ORDER BY __$start_lsn DESC
        `);
      }
      if (unions.length === 0) return [];

      const result = await pool.request().query(`
        SELECT TOP (${limit}) SourceTable, Op, ChangeTime, RecordId
        FROM (${unions.join(" UNION ALL ")}) combined
        ORDER BY Lsn DESC
      `);
      return result.recordset;
    });

    return {
      rows: rows.map((r) => ({
        table: r.SourceTable,
        operation: operationName(r.Op),
        recordId: r.RecordId,
        changeTime: r.ChangeTime,
      })),
      error: null,
    };
  } catch (err) {
    return { rows: [], error: err.message };
  }
}

module.exports = { getCdcLog };
