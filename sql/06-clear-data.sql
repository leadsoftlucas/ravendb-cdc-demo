-- Deletes all rows from every table, in FK-dependency order (children
-- first), without touching the schema. Used by the web app's
-- "Reset SQL Server data" admin button, paired with 03-import-data.sql
-- (re-seed) and 07-reseed-identities.sql (put IDENTITY counters back in
-- sync with the reseeded data).

USE CDC_Demo;
GO

DELETE FROM dbo.Adoptions;
DELETE FROM dbo.AdoptionApplications;
DELETE FROM dbo.PortalAdoptionRequests;
DELETE FROM dbo.Vaccinations;
DELETE FROM dbo.MedicalRecords;
DELETE FROM dbo.Pets;
DELETE FROM dbo.People;
DELETE FROM dbo.Veterinarians;
DELETE FROM dbo.Employees;
DELETE FROM dbo.Clinics;
GO
