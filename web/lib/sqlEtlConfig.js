const { SqlEtlConfiguration, Transformation } = require("ravendb");

const SQL_ETL_TASK_NAME = "AdoptionInterestsToSql";

// One AdoptionInterests document (created by the AI agent's action handler,
// see routes/ravenAgent.js) becomes two SQL Server rows: a denormalized,
// easy-to-explain landing row in PortalAdoptionRequests, and a real row in
// the pre-existing AdoptionApplications table (ApplicantId left NULL, the
// External* columns carrying the applicant's details — see
// sql/05-portal-etl-schema.sql for why a straight new-Person-row insert
// isn't possible here).
const TRANSFORM_SCRIPT = `
loadToPortalAdoptionRequests({
    ExternalId: id(this),
    PetId: this.PetId,
    PetName: this.PetName,
    ApplicantName: this.ApplicantName,
    ApplicantEmail: this.ApplicantEmail,
    ApplicantPhone: this.ApplicantPhone,
    Notes: this.Notes,
    RequestedAt: this.CreatedAt
});

loadToAdoptionApplications({
    PetId: this.PetId,
    ApplicantId: null,
    HandledByEmployeeId: null,
    ApplicationDate: this.CreatedAt,
    Status: 'Pending',
    Notes: this.Notes,
    DecisionDate: null,
    Source: 'Portal',
    ExternalId: id(this),
    ExternalApplicantName: this.ApplicantName,
    ExternalApplicantEmail: this.ApplicantEmail,
    ExternalApplicantPhone: this.ApplicantPhone
});
`.trim();

function buildSqlEtlConfig(connectionStringName) {
  const config = new SqlEtlConfiguration();
  config.name = SQL_ETL_TASK_NAME;
  config.connectionStringName = connectionStringName;
  config.disabled = false;
  config.parameterizeDeletes = true;

  const transformation = new Transformation();
  transformation.name = "AdoptionInterestsToSql";
  transformation.collections = ["AdoptionInterests"];
  transformation.script = TRANSFORM_SCRIPT;
  config.transforms = [transformation];

  config.sqlTables = [
    { tableName: "PortalAdoptionRequests", documentIdColumn: "ExternalId", insertOnlyMode: true },
    { tableName: "AdoptionApplications", documentIdColumn: "ExternalId", insertOnlyMode: true },
  ];

  return config;
}

module.exports = { SQL_ETL_TASK_NAME, buildSqlEtlConfig };
