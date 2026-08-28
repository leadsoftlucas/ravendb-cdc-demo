-- After 06-clear-data.sql + 03-import-data.sql (KEEPIDENTITY re-insert),
-- IDENTITY counters are wherever they were left by prior demo activity, not
-- reset to match the freshly re-seeded data. This puts each counter back at
-- the max ID actually present, so the next organic insert (from the SQL
-- panel, or from the portal's SQL ETL write-back) continues predictably
-- instead of drifting further every time the demo is reset.

USE CDC_Demo;
GO

DECLARE @max INT;

SELECT @max = ISNULL(MAX(ClinicId), 0) FROM dbo.Clinics;
DBCC CHECKIDENT ('dbo.Clinics', RESEED, @max);

SELECT @max = ISNULL(MAX(EmployeeId), 0) FROM dbo.Employees;
DBCC CHECKIDENT ('dbo.Employees', RESEED, @max);

SELECT @max = ISNULL(MAX(VeterinarianId), 0) FROM dbo.Veterinarians;
DBCC CHECKIDENT ('dbo.Veterinarians', RESEED, @max);

SELECT @max = ISNULL(MAX(PersonId), 0) FROM dbo.People;
DBCC CHECKIDENT ('dbo.People', RESEED, @max);

SELECT @max = ISNULL(MAX(PetId), 0) FROM dbo.Pets;
DBCC CHECKIDENT ('dbo.Pets', RESEED, @max);

SELECT @max = ISNULL(MAX(MedicalRecordId), 0) FROM dbo.MedicalRecords;
DBCC CHECKIDENT ('dbo.MedicalRecords', RESEED, @max);

SELECT @max = ISNULL(MAX(VaccinationId), 0) FROM dbo.Vaccinations;
DBCC CHECKIDENT ('dbo.Vaccinations', RESEED, @max);

SELECT @max = ISNULL(MAX(ApplicationId), 0) FROM dbo.AdoptionApplications;
DBCC CHECKIDENT ('dbo.AdoptionApplications', RESEED, @max);

SELECT @max = ISNULL(MAX(AdoptionId), 0) FROM dbo.Adoptions;
DBCC CHECKIDENT ('dbo.Adoptions', RESEED, @max);

SELECT @max = ISNULL(MAX(PortalAdoptionRequestId), 0) FROM dbo.PortalAdoptionRequests;
DBCC CHECKIDENT ('dbo.PortalAdoptionRequests', RESEED, @max);
GO
