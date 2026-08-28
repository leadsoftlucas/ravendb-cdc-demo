-- Imports the seed CSV files (see /data/csv) into CDC_Demo.
-- Expects the CSV files to already be copied into the container at /tmp/import
-- (the setup script in /scripts does this via `docker cp`).
--
-- Import order follows foreign-key dependencies: Clinics -> Employees ->
-- Veterinarians -> People -> Pets -> MedicalRecords -> Vaccinations ->
-- AdoptionApplications -> Adoptions.

USE CDC_Demo;
GO

SET IDENTITY_INSERT dbo.Clinics ON;
BULK INSERT dbo.Clinics
FROM '/tmp/import/clinics.csv'
WITH (FORMAT = 'CSV', FIRSTROW = 2, KEEPIDENTITY, FIELDQUOTE = '"', FIELDTERMINATOR = ',', ROWTERMINATOR = '0x0a', TABLOCK);
SET IDENTITY_INSERT dbo.Clinics OFF;
GO

SET IDENTITY_INSERT dbo.Employees ON;
BULK INSERT dbo.Employees
FROM '/tmp/import/employees.csv'
WITH (FORMAT = 'CSV', FIRSTROW = 2, KEEPIDENTITY, FIELDQUOTE = '"', FIELDTERMINATOR = ',', ROWTERMINATOR = '0x0a', TABLOCK);
SET IDENTITY_INSERT dbo.Employees OFF;
GO

SET IDENTITY_INSERT dbo.Veterinarians ON;
BULK INSERT dbo.Veterinarians
FROM '/tmp/import/veterinarians.csv'
WITH (FORMAT = 'CSV', FIRSTROW = 2, KEEPIDENTITY, FIELDQUOTE = '"', FIELDTERMINATOR = ',', ROWTERMINATOR = '0x0a', TABLOCK);
SET IDENTITY_INSERT dbo.Veterinarians OFF;
GO

SET IDENTITY_INSERT dbo.People ON;
BULK INSERT dbo.People
FROM '/tmp/import/people.csv'
WITH (FORMAT = 'CSV', FIRSTROW = 2, KEEPIDENTITY, FIELDQUOTE = '"', FIELDTERMINATOR = ',', ROWTERMINATOR = '0x0a', TABLOCK);
SET IDENTITY_INSERT dbo.People OFF;
GO

SET IDENTITY_INSERT dbo.Pets ON;
BULK INSERT dbo.Pets
FROM '/tmp/import/pets.csv'
WITH (FORMAT = 'CSV', FIRSTROW = 2, KEEPIDENTITY, FIELDQUOTE = '"', FIELDTERMINATOR = ',', ROWTERMINATOR = '0x0a', TABLOCK);
SET IDENTITY_INSERT dbo.Pets OFF;
GO

SET IDENTITY_INSERT dbo.MedicalRecords ON;
BULK INSERT dbo.MedicalRecords
FROM '/tmp/import/medical_records.csv'
WITH (FORMAT = 'CSV', FIRSTROW = 2, KEEPIDENTITY, FIELDQUOTE = '"', FIELDTERMINATOR = ',', ROWTERMINATOR = '0x0a', TABLOCK);
SET IDENTITY_INSERT dbo.MedicalRecords OFF;
GO

SET IDENTITY_INSERT dbo.Vaccinations ON;
BULK INSERT dbo.Vaccinations
FROM '/tmp/import/vaccinations.csv'
WITH (FORMAT = 'CSV', FIRSTROW = 2, KEEPIDENTITY, FIELDQUOTE = '"', FIELDTERMINATOR = ',', ROWTERMINATOR = '0x0a', TABLOCK);
SET IDENTITY_INSERT dbo.Vaccinations OFF;
GO

-- AdoptionApplications has more columns than the seed CSV (Source/External*
-- were added later by 05-portal-etl-schema.sql), so a plain BULK INSERT no
-- longer matches column-for-column. Stage into a matching-shape temp table
-- first, then INSERT the explicit column list (the new columns get their
-- defaults: Source='Clinic', External* NULL).
CREATE TABLE #AdoptionApplicationsStaging
(
    ApplicationId        INT,
    PetId                INT,
    ApplicantId          INT,
    HandledByEmployeeId  INT,
    ApplicationDate      DATE,
    Status               NVARCHAR(20),
    Notes                NVARCHAR(MAX),
    DecisionDate         DATE
);

BULK INSERT #AdoptionApplicationsStaging
FROM '/tmp/import/adoption_applications.csv'
WITH (FORMAT = 'CSV', FIRSTROW = 2, FIELDQUOTE = '"', FIELDTERMINATOR = ',', ROWTERMINATOR = '0x0a', TABLOCK);

SET IDENTITY_INSERT dbo.AdoptionApplications ON;
INSERT INTO dbo.AdoptionApplications
    (ApplicationId, PetId, ApplicantId, HandledByEmployeeId, ApplicationDate, Status, Notes, DecisionDate)
SELECT ApplicationId, PetId, ApplicantId, HandledByEmployeeId, ApplicationDate, Status, Notes, DecisionDate
FROM #AdoptionApplicationsStaging;
SET IDENTITY_INSERT dbo.AdoptionApplications OFF;

DROP TABLE #AdoptionApplicationsStaging;
GO

SET IDENTITY_INSERT dbo.Adoptions ON;
BULK INSERT dbo.Adoptions
FROM '/tmp/import/adoptions.csv'
WITH (FORMAT = 'CSV', FIRSTROW = 2, KEEPIDENTITY, FIELDQUOTE = '"', FIELDTERMINATOR = ',', ROWTERMINATOR = '0x0a', TABLOCK);
SET IDENTITY_INSERT dbo.Adoptions OFF;
GO
