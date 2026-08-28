// The CDC Sink task definition: deliberately syncs only 2 of the 9 SQL
// tables (Pets, People) into RavenDB, embedding MedicalRecords, Vaccinations
// and AdoptionApplications straight into each Pet document, and linking the
// pet's Owner. Employees/Veterinarians/Clinics never become RavenDB
// collections — a single-clinic demo gets nothing from knowing "which
// clinic", and staff attribution on a medical record is an internal
// concern, not something the public adoption portal needs.
//
// AdoptionApplications is embedded (not skipped) specifically so the
// SQL ETL -> AdoptionApplications write-back (see sqlEtlConfig.js) flows
// back into the same Pet document once CDC Sink picks up the new row —
// a live, two-directional loop.

const CDC_SINK_TASK_NAME = "SqlServerToRavenDB";

function buildCdcSinkConfig(connectionStringName) {
  return {
    Name: CDC_SINK_TASK_NAME,
    ConnectionStringName: connectionStringName,
    SkipInitialLoad: false,
    Tables: [
      {
        CollectionName: "Pets",
        SourceTableName: "Pets",
        SourceTableSchema: "dbo",
        PrimaryKeyColumns: ["PetId"],
        Columns: [
          { Column: "PetId", Name: "PetId" },
          { Column: "Name", Name: "Name" },
          { Column: "Species", Name: "Species" },
          { Column: "Breed", Name: "Breed" },
          { Column: "Sex", Name: "Sex" },
          { Column: "DateOfBirthEstimate", Name: "DateOfBirthEstimate" },
          { Column: "Color", Name: "Color" },
          { Column: "Origin", Name: "Origin" },
          { Column: "RescueDate", Name: "RescueDate" },
          { Column: "ShelterLocation", Name: "ShelterLocation" },
          { Column: "IntakeNotes", Name: "IntakeNotes" },
          { Column: "Status", Name: "Status" },
        ],
        LinkedTables: [
          {
            SourceTableName: "People",
            SourceTableSchema: "dbo",
            PropertyName: "Owner",
            LinkedCollectionName: "People",
            JoinColumns: ["OwnerId"],
          },
        ],
        EmbeddedTables: [
          {
            SourceTableName: "MedicalRecords",
            SourceTableSchema: "dbo",
            PropertyName: "MedicalHistory",
            Type: "Array",
            JoinColumns: ["PetId"],
            PrimaryKeyColumns: ["MedicalRecordId"],
            Columns: [
              { Column: "MedicalRecordId", Name: "Id" },
              { Column: "VeterinarianId", Name: "VeterinarianId" },
              { Column: "VisitDate", Name: "VisitDate" },
              { Column: "ReasonForVisit", Name: "ReasonForVisit" },
              { Column: "Symptoms", Name: "Symptoms" },
              { Column: "Diagnosis", Name: "Diagnosis" },
              { Column: "Treatment", Name: "Treatment" },
              { Column: "WeightKg", Name: "WeightKg" },
              { Column: "FollowUpDate", Name: "FollowUpDate" },
            ],
          },
          {
            SourceTableName: "Vaccinations",
            SourceTableSchema: "dbo",
            PropertyName: "Vaccinations",
            Type: "Array",
            JoinColumns: ["PetId"],
            PrimaryKeyColumns: ["VaccinationId"],
            Columns: [
              { Column: "VaccinationId", Name: "Id" },
              { Column: "VeterinarianId", Name: "VeterinarianId" },
              { Column: "VaccineName", Name: "VaccineName" },
              { Column: "DateAdministered", Name: "DateAdministered" },
              { Column: "NextDoseDate", Name: "NextDoseDate" },
            ],
          },
          {
            SourceTableName: "AdoptionApplications",
            SourceTableSchema: "dbo",
            PropertyName: "AdoptionHistory",
            Type: "Array",
            JoinColumns: ["PetId"],
            PrimaryKeyColumns: ["ApplicationId"],
            Columns: [
              { Column: "ApplicationId", Name: "Id" },
              { Column: "ApplicantId", Name: "ApplicantId" },
              { Column: "Status", Name: "Status" },
              { Column: "ApplicationDate", Name: "ApplicationDate" },
              { Column: "DecisionDate", Name: "DecisionDate" },
              { Column: "Source", Name: "Source" },
              { Column: "ExternalId", Name: "ExternalId" },
              { Column: "ExternalApplicantName", Name: "ExternalApplicantName" },
              { Column: "ExternalApplicantEmail", Name: "ExternalApplicantEmail" },
              { Column: "ExternalApplicantPhone", Name: "ExternalApplicantPhone" },
            ],
          },
        ],
      },
      {
        CollectionName: "People",
        SourceTableName: "People",
        SourceTableSchema: "dbo",
        PrimaryKeyColumns: ["PersonId"],
        Columns: [
          { Column: "PersonId", Name: "PersonId" },
          { Column: "FullName", Name: "FullName" },
          { Column: "Email", Name: "Email" },
          { Column: "Phone", Name: "Phone" },
          { Column: "City", Name: "City" },
          { Column: "Country", Name: "Country" },
        ],
      },
    ],
  };
}

module.exports = { CDC_SINK_TASK_NAME, buildCdcSinkConfig };
