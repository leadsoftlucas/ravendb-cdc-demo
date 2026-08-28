-- Enables SQL Server Change Data Capture on CDC_Demo and every table.
-- Requires the SQL Server Agent service to be running (MSSQL_AGENT_ENABLED=true
-- on the Docker container) — CDC capture jobs run under the Agent.
--
-- RavenDB's CDC Sink task can do this automatically at task startup if the
-- connection string's SQL user has permission; this script does it explicitly
-- so the source database is ready and verifiable before the RavenDB side
-- is configured.

USE CDC_Demo;
GO

-- Checks the CURRENT database's own flag (DB_ID(), not a hardcoded name) —
-- this script is also run against differently-named databases when the
-- "configure connection" modal provisions a fresh environment.
IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE database_id = DB_ID() AND is_cdc_enabled = 1)
BEGIN
    EXEC sys.sp_cdc_enable_db;
END
GO

DECLARE @tables TABLE (TableName SYSNAME);
INSERT INTO @tables (TableName) VALUES
    (N'Clinics'), (N'Employees'), (N'Veterinarians'), (N'People'), (N'Pets'),
    (N'MedicalRecords'), (N'Vaccinations'), (N'AdoptionApplications'), (N'Adoptions');

DECLARE @tableName SYSNAME;
DECLARE table_cursor CURSOR LOCAL FAST_FORWARD FOR SELECT TableName FROM @tables;
OPEN table_cursor;
FETCH NEXT FROM table_cursor INTO @tableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM sys.tables t
        WHERE t.name = @tableName AND t.is_tracked_by_cdc = 1
    )
    BEGIN
        EXEC sys.sp_cdc_enable_table
            @source_schema = N'dbo',
            @source_name = @tableName,
            @role_name = NULL,
            @supports_net_changes = 1;
    END
    FETCH NEXT FROM table_cursor INTO @tableName;
END

CLOSE table_cursor;
DEALLOCATE table_cursor;
GO

-- Verification: every application table should show is_tracked_by_cdc = 1
SELECT name AS TableName, is_tracked_by_cdc
FROM sys.tables
WHERE is_ms_shipped = 0
ORDER BY name;
GO
