// Column definitions for every seed CSV, used to bulk-copy rows straight
// into SQL Server over the network connection (see sqlProvision.js) instead
// of server-side BULK INSERT ... FROM '<path>' — which only works when the
// CSV is reachable from the SQL Server host's own filesystem, not from
// wherever this Node process happens to be running. Listing only the
// columns each CSV actually has (rather than every column the table has)
// is also what lets AdoptionApplications import cleanly even though the
// table has 5 more columns (Source/External*) than the seed CSV: the
// unlisted columns just get their schema defaults.

const sql = require("mssql");

function str(name, sqlType, nullable) {
  return { name, sqlType, nullable, coerce: (v) => (v === undefined || v === null || v === "" ? null : v) };
}

function int(name, nullable) {
  return {
    name,
    sqlType: sql.Int,
    nullable,
    coerce: (v) => (v === undefined || v === null || v === "" ? null : parseInt(v, 10)),
  };
}

function decimal(name, precision, scale, nullable) {
  return {
    name,
    sqlType: sql.Decimal(precision, scale),
    nullable,
    coerce: (v) => (v === undefined || v === null || v === "" ? null : parseFloat(v)),
  };
}

function bit(name, nullable) {
  return {
    name,
    sqlType: sql.Bit,
    nullable,
    coerce: (v) => (v === undefined || v === null || v === "" ? null : v === "1" || v.toLowerCase() === "true"),
  };
}

function date(name, nullable) {
  return {
    name,
    sqlType: sql.Date,
    nullable,
    coerce: (v) => (v === undefined || v === null || v === "" ? null : new Date(v.replace(" ", "T"))),
  };
}

function dateTime2(name, nullable) {
  return {
    name,
    sqlType: sql.DateTime2,
    nullable,
    coerce: (v) => (v === undefined || v === null || v === "" ? null : new Date(v.replace(" ", "T"))),
  };
}

// Order matters: every table must be seeded after the tables its FKs point to.
const SEED_TABLES = [
  {
    table: "Clinics",
    csv: "clinics.csv",
    columns: [
      int("ClinicId", false),
      str("Name", sql.NVarChar(200), false),
      str("AddressLine", sql.NVarChar(300), true),
      str("City", sql.NVarChar(100), true),
      str("State", sql.NVarChar(100), true),
      str("Country", sql.NVarChar(100), true),
      str("Phone", sql.NVarChar(50), true),
      str("Email", sql.NVarChar(200), true),
    ],
  },
  {
    table: "Employees",
    csv: "employees.csv",
    columns: [
      int("EmployeeId", false),
      int("ClinicId", false),
      str("FullName", sql.NVarChar(200), false),
      str("Department", sql.NVarChar(50), false),
      str("JobTitle", sql.NVarChar(100), false),
      str("Email", sql.NVarChar(200), true),
      str("Phone", sql.NVarChar(50), true),
      date("HiredDate", false),
    ],
  },
  {
    table: "Veterinarians",
    csv: "veterinarians.csv",
    columns: [
      int("VeterinarianId", false),
      int("EmployeeId", false),
      str("LicenseNumber", sql.NVarChar(50), false),
      str("Specialty", sql.NVarChar(100), true),
      int("YearsOfExperience", true),
    ],
  },
  {
    table: "People",
    csv: "people.csv",
    columns: [
      int("PersonId", false),
      str("FullName", sql.NVarChar(200), false),
      str("Email", sql.NVarChar(200), true),
      str("Phone", sql.NVarChar(50), true),
      str("AddressLine", sql.NVarChar(300), true),
      str("City", sql.NVarChar(100), true),
      str("State", sql.NVarChar(100), true),
      str("Country", sql.NVarChar(100), true),
      str("DocumentId", sql.NVarChar(50), true),
    ],
  },
  {
    table: "Pets",
    csv: "pets.csv",
    columns: [
      int("PetId", false),
      str("Name", sql.NVarChar(100), false),
      str("Species", sql.NVarChar(50), false),
      str("Breed", sql.NVarChar(100), true),
      str("Sex", sql.NVarChar(10), true),
      date("DateOfBirthEstimate", true),
      str("Color", sql.NVarChar(100), true),
      str("Origin", sql.NVarChar(20), false),
      int("ClinicId", false),
      int("OwnerId", true),
      date("RescueDate", true),
      str("ShelterLocation", sql.NVarChar(150), true),
      str("IntakeNotes", sql.NVarChar(sql.MAX), true),
      str("Status", sql.NVarChar(30), false),
    ],
  },
  {
    table: "MedicalRecords",
    csv: "medical_records.csv",
    columns: [
      int("MedicalRecordId", false),
      int("PetId", false),
      int("VeterinarianId", false),
      dateTime2("VisitDate", false),
      str("ReasonForVisit", sql.NVarChar(200), true),
      str("Symptoms", sql.NVarChar(sql.MAX), true),
      str("Diagnosis", sql.NVarChar(sql.MAX), true),
      str("Treatment", sql.NVarChar(sql.MAX), true),
      decimal("WeightKg", 5, 2, true),
      date("FollowUpDate", true),
    ],
  },
  {
    table: "Vaccinations",
    csv: "vaccinations.csv",
    columns: [
      int("VaccinationId", false),
      int("PetId", false),
      int("VeterinarianId", false),
      str("VaccineName", sql.NVarChar(150), false),
      date("DateAdministered", false),
      date("NextDoseDate", true),
    ],
  },
  {
    // Only the 8 columns the seed CSV has — the table itself has 5 more
    // (Source/ExternalId/External*) added later by 05-portal-etl-schema.sql,
    // which get their schema defaults (Source='Clinic', the rest NULL).
    table: "AdoptionApplications",
    csv: "adoption_applications.csv",
    columns: [
      int("ApplicationId", false),
      int("PetId", false),
      int("ApplicantId", true),
      int("HandledByEmployeeId", true),
      date("ApplicationDate", false),
      str("Status", sql.NVarChar(20), false),
      str("Notes", sql.NVarChar(sql.MAX), true),
      date("DecisionDate", true),
    ],
  },
  {
    table: "Adoptions",
    csv: "adoptions.csv",
    columns: [
      int("AdoptionId", false),
      int("ApplicationId", false),
      int("PetId", false),
      int("AdopterId", false),
      date("AdoptionDate", false),
      int("ProcessedByEmployeeId", true),
      bit("IncludedVetCheckup", false),
      int("CheckupMedicalRecordId", true),
    ],
  },
];

module.exports = { SEED_TABLES };
