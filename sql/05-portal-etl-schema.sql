-- Adds support for adoption interests captured through the RavenDB-powered
-- portal, flowing back into SQL Server via SQL ETL (RavenDB -> SQL Server,
-- the reverse direction of CDC Sink).
--
-- Design: rather than trying to create a new dbo.People row synchronously
-- from an ETL transform script (SQL ETL has no way to chain a freshly
-- generated IDENTITY value from one loadTo call into another within the
-- same run), portal-sourced applications carry their applicant's contact
-- details inline and leave ApplicantId NULL. Clinic staff "promote" a
-- genuine lead into a real dbo.People row using the existing SQL panel,
-- then set ApplicantId themselves.
--
-- dbo.PortalAdoptionRequests is a second, denormalized landing table the
-- same ETL task also writes to (SQL ETL's loadTo can be called more than
-- once per script) purely for a clear before/after story of "here's the
-- raw digital lead" vs. "here's it living in the real table."

USE CDC_Demo;
GO

-- Each DDL statement runs via dynamic SQL so it's parsed at execution time —
-- otherwise SQL Server tries to resolve column names for the whole batch up
-- front and fails on columns added earlier in this same script.
IF COL_LENGTH('dbo.AdoptionApplications', 'Source') IS NULL
BEGIN
    EXEC('ALTER TABLE dbo.AdoptionApplications ALTER COLUMN ApplicantId INT NULL');

    EXEC('ALTER TABLE dbo.AdoptionApplications ADD
        Source                 NVARCHAR(20)  NOT NULL CONSTRAINT DF_AdoptionApplications_Source DEFAULT (''Clinic''),
        ExternalId              NVARCHAR(100) NULL,
        ExternalApplicantName   NVARCHAR(200) NULL,
        ExternalApplicantEmail  NVARCHAR(200) NULL,
        ExternalApplicantPhone  NVARCHAR(50)  NULL');

    EXEC('ALTER TABLE dbo.AdoptionApplications ADD CONSTRAINT CK_AdoptionApplications_Source
        CHECK (
            (Source = ''Clinic'' AND ApplicantId IS NOT NULL)
            OR
            (Source = ''Portal'' AND ExternalApplicantName IS NOT NULL)
        )');

    EXEC('ALTER TABLE dbo.AdoptionApplications ADD CONSTRAINT CK_AdoptionApplications_Source_Values
        CHECK (Source IN (''Clinic'', ''Portal''))');
END
GO

IF OBJECT_ID(N'dbo.PortalAdoptionRequests', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PortalAdoptionRequests
    (
        PortalAdoptionRequestId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ExternalId              NVARCHAR(100) NOT NULL,  -- RavenDB AdoptionInterests/... document id
        PetId                   INT           NOT NULL,  -- not a FK on purpose: this table mirrors an external submission as-is
        PetName                 NVARCHAR(100) NULL,
        ApplicantName           NVARCHAR(200) NOT NULL,
        ApplicantEmail          NVARCHAR(200) NULL,
        ApplicantPhone          NVARCHAR(50)  NULL,
        Notes                   NVARCHAR(MAX) NULL,
        RequestedAt             DATETIME2     NOT NULL,
        ReceivedAt              DATETIME2     NOT NULL CONSTRAINT DF_PortalAdoptionRequests_ReceivedAt DEFAULT (SYSUTCDATETIME())
    );

    CREATE UNIQUE INDEX UX_PortalAdoptionRequests_ExternalId ON dbo.PortalAdoptionRequests (ExternalId);
END
GO
