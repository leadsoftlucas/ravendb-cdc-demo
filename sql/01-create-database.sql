-- Creates the source database for the RavenDB CDC demo.
-- Run against the `master` database.

IF DB_ID(N'CDC_Demo') IS NULL
BEGIN
    CREATE DATABASE CDC_Demo;
END
GO
