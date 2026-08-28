-- Schema for the "vet clinic + shelter" domain used by the RavenDB CDC demo.
-- Run against the CDC_Demo database (see 01-create-database.sql).
--
-- Design notes:
--   - Employees / Veterinarians models a 1:1 "role extension" (a Veterinarian
--     is an Employee with extra clinical credentials).
--   - Pets.OwnerId is nullable: a pet is only linked to a tutor once it is
--     owned; shelter pets awaiting adoption have no owner yet.
--   - Adoptions.CheckupMedicalRecordId is nullable: an adoption may or may
--     not have gone through a clinic checkup first.

USE CDC_Demo;
GO

IF OBJECT_ID(N'dbo.Adoptions', N'U') IS NOT NULL DROP TABLE dbo.Adoptions;
IF OBJECT_ID(N'dbo.AdoptionApplications', N'U') IS NOT NULL DROP TABLE dbo.AdoptionApplications;
IF OBJECT_ID(N'dbo.Vaccinations', N'U') IS NOT NULL DROP TABLE dbo.Vaccinations;
IF OBJECT_ID(N'dbo.MedicalRecords', N'U') IS NOT NULL DROP TABLE dbo.MedicalRecords;
IF OBJECT_ID(N'dbo.Pets', N'U') IS NOT NULL DROP TABLE dbo.Pets;
IF OBJECT_ID(N'dbo.People', N'U') IS NOT NULL DROP TABLE dbo.People;
IF OBJECT_ID(N'dbo.Veterinarians', N'U') IS NOT NULL DROP TABLE dbo.Veterinarians;
IF OBJECT_ID(N'dbo.Employees', N'U') IS NOT NULL DROP TABLE dbo.Employees;
IF OBJECT_ID(N'dbo.Clinics', N'U') IS NOT NULL DROP TABLE dbo.Clinics;
GO

CREATE TABLE dbo.Clinics
(
    ClinicId    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name        NVARCHAR(200) NOT NULL,
    AddressLine NVARCHAR(300) NULL,
    City        NVARCHAR(100) NULL,
    State       NVARCHAR(100) NULL,
    Country     NVARCHAR(100) NULL,
    Phone       NVARCHAR(50)  NULL,
    Email       NVARCHAR(200) NULL
);
GO

CREATE TABLE dbo.Employees
(
    EmployeeId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ClinicId   INT NOT NULL REFERENCES dbo.Clinics (ClinicId),
    FullName   NVARCHAR(200) NOT NULL,
    Department NVARCHAR(50) NOT NULL CHECK (Department IN ('Clinical', 'Shelter', 'Administration')),
    JobTitle   NVARCHAR(100) NOT NULL,
    Email      NVARCHAR(200) NULL,
    Phone      NVARCHAR(50)  NULL,
    HiredDate  DATE NOT NULL
);
GO

CREATE TABLE dbo.Veterinarians
(
    VeterinarianId    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    EmployeeId        INT NOT NULL UNIQUE REFERENCES dbo.Employees (EmployeeId),
    LicenseNumber     NVARCHAR(50) NOT NULL,
    Specialty         NVARCHAR(100) NULL,
    YearsOfExperience INT NULL
);
GO

CREATE TABLE dbo.People
(
    PersonId    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    FullName    NVARCHAR(200) NOT NULL,
    Email       NVARCHAR(200) NULL,
    Phone       NVARCHAR(50)  NULL,
    AddressLine NVARCHAR(300) NULL,
    City        NVARCHAR(100) NULL,
    State       NVARCHAR(100) NULL,
    Country     NVARCHAR(100) NULL,
    DocumentId  NVARCHAR(50)  NULL
);
GO

CREATE TABLE dbo.Pets
(
    PetId               INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name                NVARCHAR(100) NOT NULL,
    Species             NVARCHAR(50) NOT NULL,
    Breed               NVARCHAR(100) NULL,
    Sex                 NVARCHAR(10) NULL CHECK (Sex IN ('Male', 'Female', 'Unknown')),
    DateOfBirthEstimate DATE NULL,
    Color               NVARCHAR(100) NULL,
    Origin              NVARCHAR(20) NOT NULL CHECK (Origin IN ('Owned', 'Rescued')),
    ClinicId            INT NOT NULL REFERENCES dbo.Clinics (ClinicId),
    OwnerId             INT NULL REFERENCES dbo.People (PersonId),
    RescueDate          DATE NULL,
    ShelterLocation     NVARCHAR(150) NULL,
    IntakeNotes         NVARCHAR(MAX) NULL,
    Status              NVARCHAR(30) NOT NULL
        CHECK (Status IN ('ClinicPatient', 'InShelter', 'PendingAdoption', 'Adopted', 'Deceased'))
);
GO

CREATE TABLE dbo.MedicalRecords
(
    MedicalRecordId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    PetId           INT NOT NULL REFERENCES dbo.Pets (PetId),
    VeterinarianId  INT NOT NULL REFERENCES dbo.Veterinarians (VeterinarianId),
    VisitDate       DATETIME2 NOT NULL,
    ReasonForVisit  NVARCHAR(200) NULL,
    Symptoms        NVARCHAR(MAX) NULL,
    Diagnosis       NVARCHAR(MAX) NULL,
    Treatment       NVARCHAR(MAX) NULL,
    WeightKg        DECIMAL(5, 2) NULL,
    FollowUpDate    DATE NULL
);
GO

CREATE TABLE dbo.Vaccinations
(
    VaccinationId     INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    PetId             INT NOT NULL REFERENCES dbo.Pets (PetId),
    VeterinarianId    INT NOT NULL REFERENCES dbo.Veterinarians (VeterinarianId),
    VaccineName       NVARCHAR(150) NOT NULL,
    DateAdministered  DATE NOT NULL,
    NextDoseDate      DATE NULL
);
GO

CREATE TABLE dbo.AdoptionApplications
(
    ApplicationId       INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    PetId               INT NOT NULL REFERENCES dbo.Pets (PetId),
    ApplicantId         INT NOT NULL REFERENCES dbo.People (PersonId),
    HandledByEmployeeId INT NULL REFERENCES dbo.Employees (EmployeeId),
    ApplicationDate     DATE NOT NULL,
    Status              NVARCHAR(20) NOT NULL
        CHECK (Status IN ('Pending', 'UnderReview', 'Approved', 'Rejected', 'Withdrawn')),
    Notes               NVARCHAR(MAX) NULL,
    DecisionDate        DATE NULL
);
GO

CREATE TABLE dbo.Adoptions
(
    AdoptionId             INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ApplicationId          INT NOT NULL UNIQUE REFERENCES dbo.AdoptionApplications (ApplicationId),
    PetId                  INT NOT NULL REFERENCES dbo.Pets (PetId),
    AdopterId               INT NOT NULL REFERENCES dbo.People (PersonId),
    AdoptionDate           DATE NOT NULL,
    ProcessedByEmployeeId  INT NULL REFERENCES dbo.Employees (EmployeeId),
    IncludedVetCheckup     BIT NOT NULL DEFAULT (0),
    CheckupMedicalRecordId INT NULL REFERENCES dbo.MedicalRecords (MedicalRecordId)
);
GO
