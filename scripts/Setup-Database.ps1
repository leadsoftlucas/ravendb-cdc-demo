<#
.SYNOPSIS
    Creates the CDC_Demo SQL Server database, schema, and seed data inside a
    running SQL Server Docker container.

.DESCRIPTION
    Copies /sql and /data/csv into the container and runs the schema +
    import scripts through sqlcmd. Requires the SQL Server container from
    the README's "Getting Started" section to already be running.

.PARAMETER ContainerName
    Name of the running SQL Server container (default: sqlserver2022).

.PARAMETER SaPassword
    The `sa` password. Defaults to the CDC_DEMO_SA_PASSWORD environment
    variable so the password never has to be typed into a script or command
    history.

.EXAMPLE
    $env:CDC_DEMO_SA_PASSWORD = "<the-password-you-chose-when-starting-the-container>"
    ./Setup-Database.ps1
#>
param(
    [string]$ContainerName = "sqlserver2022",
    [string]$SaPassword = $env:CDC_DEMO_SA_PASSWORD
)

if (-not $SaPassword) {
    throw "Set `$env:CDC_DEMO_SA_PASSWORD to the SQL Server 'sa' password, or pass -SaPassword."
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$sqlDir = Join-Path $repoRoot "sql"
$csvDir = Join-Path $repoRoot "data\csv"
$sqlcmd = "/opt/mssql-tools18/bin/sqlcmd"

Write-Host "Copying SQL scripts and CSV seed data into container '$ContainerName'..."
docker exec $ContainerName mkdir -p /tmp/sql /tmp/import
docker cp "$sqlDir\." "${ContainerName}:/tmp/sql"
docker cp "$csvDir\." "${ContainerName}:/tmp/import"

function Invoke-SqlScript([string]$FileName) {
    Write-Host "Running $FileName..."
    docker exec $ContainerName $sqlcmd -S localhost -U sa -P $SaPassword -No -i "/tmp/sql/$FileName"
    if ($LASTEXITCODE -ne 0) {
        throw "sqlcmd failed while running $FileName (exit code $LASTEXITCODE)."
    }
}

Invoke-SqlScript "01-create-database.sql"
Invoke-SqlScript "02-create-schema.sql"
Invoke-SqlScript "03-import-data.sql"

Write-Host "CDC_Demo database created and seeded." -ForegroundColor Green
