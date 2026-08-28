// Single source of truth for the SQL Server admin UI: one entry per table.
// `columns[].type` drives both form rendering (client) and SQL parameter
// binding (server) — see SQL_TYPES in ../routes/sqlData.js.
//
// "fk" columns are the N:1 parent side of a relationship (e.g. Pets.OwnerId
// -> People). The 1:N child side (e.g. People -> Pets owned) is *derived*
// from these at runtime (see buildChildren in sqlData.js) so each
// relationship is declared exactly once.

const TABLES = {
  Clinics: {
    label: "Clinics",
    pk: "ClinicId",
    listColumns: ["ClinicId", "Name", "City", "Country", "Phone"],
    searchable: ["Name", "City", "Country"],
    filters: [],
    labelColumns: ["Name"],
    columns: [
      { name: "ClinicId", type: "int", label: "ID", pk: true },
      { name: "Name", type: "text", label: "Name" },
      { name: "AddressLine", type: "text", label: "Address", nullable: true },
      { name: "City", type: "text", label: "City", nullable: true },
      { name: "State", type: "text", label: "State", nullable: true },
      { name: "Country", type: "text", label: "Country", nullable: true },
      { name: "Phone", type: "text", label: "Phone", nullable: true },
      { name: "Email", type: "text", label: "Email", nullable: true },
    ],
  },

  Employees: {
    label: "Employees",
    pk: "EmployeeId",
    listColumns: ["EmployeeId", "FullName", "Department", "JobTitle", "HiredDate"],
    searchable: ["FullName", "JobTitle"],
    filters: [{ column: "Department", options: ["Clinical", "Shelter", "Administration"] }],
    labelColumns: ["FullName"],
    columns: [
      { name: "EmployeeId", type: "int", label: "ID", pk: true },
      { name: "ClinicId", type: "fk", ref: "Clinics", label: "Clinic" },
      { name: "FullName", type: "text", label: "Full name" },
      { name: "Department", type: "select", label: "Department", options: ["Clinical", "Shelter", "Administration"] },
      { name: "JobTitle", type: "text", label: "Job title" },
      { name: "Email", type: "text", label: "Email", nullable: true },
      { name: "Phone", type: "text", label: "Phone", nullable: true },
      { name: "HiredDate", type: "date", label: "Hired date" },
    ],
  },

  Veterinarians: {
    label: "Veterinarians",
    pk: "VeterinarianId",
    listColumns: ["VeterinarianId", "EmployeeId", "LicenseNumber", "Specialty", "YearsOfExperience"],
    searchable: ["LicenseNumber", "Specialty"],
    filters: [],
    labelExpression:
      "(SELECT e.FullName FROM dbo.Employees e WHERE e.EmployeeId = Veterinarians.EmployeeId) + N' — ' + LicenseNumber",
    columns: [
      { name: "VeterinarianId", type: "int", label: "ID", pk: true },
      { name: "EmployeeId", type: "fk", ref: "Employees", label: "Employee" },
      { name: "LicenseNumber", type: "text", label: "License number" },
      { name: "Specialty", type: "text", label: "Specialty", nullable: true },
      { name: "YearsOfExperience", type: "int", label: "Years of experience", nullable: true },
    ],
  },

  People: {
    label: "People",
    pk: "PersonId",
    listColumns: ["PersonId", "FullName", "City", "Country", "Email"],
    searchable: ["FullName", "Email", "City", "Country"],
    filters: [],
    labelColumns: ["FullName"],
    columns: [
      { name: "PersonId", type: "int", label: "ID", pk: true },
      { name: "FullName", type: "text", label: "Full name" },
      { name: "Email", type: "text", label: "Email", nullable: true },
      { name: "Phone", type: "text", label: "Phone", nullable: true },
      { name: "AddressLine", type: "text", label: "Address", nullable: true },
      { name: "City", type: "text", label: "City", nullable: true },
      { name: "State", type: "text", label: "State", nullable: true },
      { name: "Country", type: "text", label: "Country", nullable: true },
      { name: "DocumentId", type: "text", label: "Document ID", nullable: true },
    ],
  },

  Pets: {
    label: "Pets",
    pk: "PetId",
    listColumns: ["PetId", "Name", "Species", "Origin", "Status"],
    searchable: ["Name", "Breed", "Species"],
    filters: [
      { column: "Origin", options: ["Owned", "Rescued"] },
      { column: "Status", options: ["ClinicPatient", "InShelter", "PendingAdoption", "Adopted", "Deceased"] },
    ],
    labelExpression: "Name + N' (' + Species + N')'",
    columns: [
      { name: "PetId", type: "int", label: "ID", pk: true },
      { name: "Name", type: "text", label: "Name" },
      { name: "Species", type: "text", label: "Species" },
      { name: "Breed", type: "text", label: "Breed", nullable: true },
      { name: "Sex", type: "select", label: "Sex", options: ["Male", "Female", "Unknown"], nullable: true },
      { name: "DateOfBirthEstimate", type: "date", label: "Date of birth (estimate)", nullable: true },
      { name: "Color", type: "text", label: "Color", nullable: true },
      { name: "Origin", type: "select", label: "Origin", options: ["Owned", "Rescued"] },
      { name: "ClinicId", type: "fk", ref: "Clinics", label: "Clinic" },
      { name: "OwnerId", type: "fk", ref: "People", label: "Owner / tutor", nullable: true },
      { name: "RescueDate", type: "date", label: "Rescue date", nullable: true },
      { name: "ShelterLocation", type: "text", label: "Shelter location", nullable: true },
      { name: "IntakeNotes", type: "textarea", label: "Intake notes", nullable: true },
      {
        name: "Status",
        type: "select",
        label: "Status",
        options: ["ClinicPatient", "InShelter", "PendingAdoption", "Adopted", "Deceased"],
      },
    ],
  },

  MedicalRecords: {
    label: "Medical Records",
    pk: "MedicalRecordId",
    listColumns: ["MedicalRecordId", "PetId", "VisitDate", "ReasonForVisit", "Diagnosis"],
    searchable: ["ReasonForVisit", "Diagnosis", "Symptoms"],
    filters: [],
    labelExpression: "CONVERT(varchar, VisitDate, 23) + N' — ' + ISNULL(ReasonForVisit, N'Visit')",
    columns: [
      { name: "MedicalRecordId", type: "int", label: "ID", pk: true },
      { name: "PetId", type: "fk", ref: "Pets", label: "Pet" },
      { name: "VeterinarianId", type: "fk", ref: "Veterinarians", label: "Veterinarian" },
      { name: "VisitDate", type: "datetime", label: "Visit date" },
      { name: "ReasonForVisit", type: "text", label: "Reason for visit", nullable: true },
      { name: "Symptoms", type: "textarea", label: "Symptoms", nullable: true },
      { name: "Diagnosis", type: "textarea", label: "Diagnosis", nullable: true },
      { name: "Treatment", type: "textarea", label: "Treatment", nullable: true },
      { name: "WeightKg", type: "decimal", label: "Weight (kg)", nullable: true },
      { name: "FollowUpDate", type: "date", label: "Follow-up date", nullable: true },
    ],
  },

  Vaccinations: {
    label: "Vaccinations",
    pk: "VaccinationId",
    listColumns: ["VaccinationId", "PetId", "VaccineName", "DateAdministered", "NextDoseDate"],
    searchable: ["VaccineName"],
    filters: [],
    labelExpression: "VaccineName + N' (' + CONVERT(varchar, DateAdministered, 23) + N')'",
    columns: [
      { name: "VaccinationId", type: "int", label: "ID", pk: true },
      { name: "PetId", type: "fk", ref: "Pets", label: "Pet" },
      { name: "VeterinarianId", type: "fk", ref: "Veterinarians", label: "Veterinarian" },
      { name: "VaccineName", type: "text", label: "Vaccine" },
      { name: "DateAdministered", type: "date", label: "Date administered" },
      { name: "NextDoseDate", type: "date", label: "Next dose date", nullable: true },
    ],
  },

  AdoptionApplications: {
    label: "Adoption Applications",
    pk: "ApplicationId",
    listColumns: ["ApplicationId", "PetId", "Source", "Status", "ApplicationDate"],
    searchable: ["Notes", "ExternalApplicantName", "ExternalApplicantEmail"],
    filters: [
      { column: "Status", options: ["Pending", "UnderReview", "Approved", "Rejected", "Withdrawn"] },
      { column: "Source", options: ["Clinic", "Portal"] },
    ],
    labelExpression: "N'Application #' + CAST(ApplicationId AS varchar) + N' — ' + Status",
    columns: [
      { name: "ApplicationId", type: "int", label: "ID", pk: true },
      { name: "PetId", type: "fk", ref: "Pets", label: "Pet" },
      { name: "ApplicantId", type: "fk", ref: "People", label: "Applicant", nullable: true },
      { name: "HandledByEmployeeId", type: "fk", ref: "Employees", label: "Handled by", nullable: true },
      { name: "ApplicationDate", type: "date", label: "Application date" },
      {
        name: "Status",
        type: "select",
        label: "Status",
        options: ["Pending", "UnderReview", "Approved", "Rejected", "Withdrawn"],
      },
      { name: "Notes", type: "textarea", label: "Notes", nullable: true },
      { name: "DecisionDate", type: "date", label: "Decision date", nullable: true },
      {
        name: "Source",
        type: "select",
        label: "Source",
        options: ["Clinic", "Portal"],
      },
      { name: "ExternalId", type: "text", label: "RavenDB source doc (external ID)", nullable: true },
      { name: "ExternalApplicantName", type: "text", label: "Applicant name (portal)", nullable: true },
      { name: "ExternalApplicantEmail", type: "text", label: "Applicant email (portal)", nullable: true },
      { name: "ExternalApplicantPhone", type: "text", label: "Applicant phone (portal)", nullable: true },
    ],
  },

  PortalAdoptionRequests: {
    label: "Portal Adoption Requests",
    pk: "PortalAdoptionRequestId",
    listColumns: ["PortalAdoptionRequestId", "PetName", "ApplicantName", "RequestedAt"],
    searchable: ["ApplicantName", "ApplicantEmail", "PetName"],
    filters: [],
    labelExpression: "ApplicantName + N' — ' + ISNULL(PetName, N'?')",
    columns: [
      { name: "PortalAdoptionRequestId", type: "int", label: "ID", pk: true },
      { name: "ExternalId", type: "text", label: "RavenDB source doc (external ID)" },
      { name: "PetId", type: "fk", ref: "Pets", label: "Pet" },
      { name: "PetName", type: "text", label: "Pet name (as submitted)", nullable: true },
      { name: "ApplicantName", type: "text", label: "Applicant name" },
      { name: "ApplicantEmail", type: "text", label: "Applicant email", nullable: true },
      { name: "ApplicantPhone", type: "text", label: "Applicant phone", nullable: true },
      { name: "Notes", type: "textarea", label: "Notes", nullable: true },
      { name: "RequestedAt", type: "datetime", label: "Requested at" },
      { name: "ReceivedAt", type: "datetime", label: "Received at" },
    ],
  },

  Adoptions: {
    label: "Adoptions",
    pk: "AdoptionId",
    listColumns: ["AdoptionId", "PetId", "AdopterId", "AdoptionDate", "IncludedVetCheckup"],
    searchable: [],
    filters: [],
    labelExpression: "N'Adoption #' + CAST(AdoptionId AS varchar)",
    columns: [
      { name: "AdoptionId", type: "int", label: "ID", pk: true },
      { name: "ApplicationId", type: "fk", ref: "AdoptionApplications", label: "Application" },
      { name: "PetId", type: "fk", ref: "Pets", label: "Pet" },
      { name: "AdopterId", type: "fk", ref: "People", label: "Adopter" },
      { name: "AdoptionDate", type: "date", label: "Adoption date" },
      { name: "ProcessedByEmployeeId", type: "fk", ref: "Employees", label: "Processed by", nullable: true },
      { name: "IncludedVetCheckup", type: "boolean", label: "Included vet checkup" },
      {
        name: "CheckupMedicalRecordId",
        type: "fk",
        ref: "MedicalRecords",
        label: "Pre-adoption checkup",
        nullable: true,
      },
    ],
  },
};

module.exports = { TABLES };
