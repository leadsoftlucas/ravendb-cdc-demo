const { ravenFetch, toggleTaskState } = require("../lib/ravenAdmin");
const { PET_STATS_INDEX_NAME } = require("../lib/ravenIndexes");
const { EMBEDDINGS_IDENTIFIER } = require("../lib/embeddingsConfig");

const TOGGLEABLE_TASK_TYPES = ["CdcSink", "GenAi", "EmbeddingsGeneration"];

async function getPetStats() {
  const query = `from index '${PET_STATS_INDEX_NAME}' select Species, Status, Origin, Count`;
  const result = await ravenFetch("/queries", { method: "POST", body: JSON.stringify({ Query: query }) });
  return { rows: result.Results, durationMs: result.DurationInMs, indexName: result.IndexName };
}

function buildAvailablePetsQuery(description) {
  const baseSelect =
    "select Name, Species, Breed, Sex, Status, Origin, AI.AdoptionBio as AdoptionBio, " +
    "AI.TemperamentTags as TemperamentTags, PetId";

  if (description && description.trim()) {
    return {
      Query:
        `from Pets where vector.search(embedding.text(AI.FullDescription, ai.task('${EMBEDDINGS_IDENTIFIER}')), $description, 0.45) ` +
        `and Status in ('InShelter', 'PendingAdoption') ${baseSelect}`,
      QueryParameters: { description },
    };
  }

  return {
    Query: `from Pets where Status in ('InShelter', 'PendingAdoption') ${baseSelect}`,
    QueryParameters: {},
  };
}

async function searchAvailablePets(description) {
  const body = buildAvailablePetsQuery(description);
  const result = await ravenFetch("/queries", { method: "POST", body: JSON.stringify(body) });
  return { rows: result.Results, durationMs: result.DurationInMs, indexName: result.IndexName, isSemantic: Boolean(description && description.trim()) };
}

async function getTaskStates() {
  const result = await ravenFetch("/tasks");
  return result.OngoingTasks.filter((t) => TOGGLEABLE_TASK_TYPES.includes(t.TaskType)).map((t) => ({
    type: t.TaskType,
    name: t.TaskName,
    taskId: t.TaskId,
    enabled: t.TaskState === "Enabled",
    connectionStatus: t.TaskConnectionStatus,
  }));
}

async function toggleTask(taskId, type, disable) {
  if (!TOGGLEABLE_TASK_TYPES.includes(type)) {
    const err = new Error(`Unsupported task type "${type}"`);
    err.status = 400;
    throw err;
  }
  await toggleTaskState(taskId, type, disable);
  return getTaskStates();
}

async function getPulseSample() {
  const stats = await ravenFetch("/stats");
  return { lastDocEtag: stats.LastDocEtag, documentCount: stats.CountOfDocuments };
}

function monthKey(dateString) {
  if (!dateString) return null;
  // RavenDB dates come back as ISO strings — slicing avoids a timezone-shift
  // surprise from parsing into a local Date just to read year/month back out.
  return dateString.slice(0, 7);
}

function bumpMonth(bucket, key) {
  if (!key) return;
  bucket[key] = (bucket[key] || 0) + 1;
}

// A dynamic (not indexed) query, run ad hoc rather than via a static index
// like getPetStats() — this chart is a "does this even tell an interesting
// story" experiment, not a load-bearing dashboard number, so it doesn't
// warrant a dedicated map-reduce index the way the species/status stats do.
// Combines four different date fields, scattered across embedded arrays
// on every Pet document, into one aligned monthly timeline: when pets got
// rescued, when they were seen/treated, when they got vaccinated, and when
// an adoption application already on file was actually approved (RavenDB
// has no synced Adoptions collection — DecisionDate on an Approved
// AdoptionApplications entry is the closest stand-in for "adopted" this
// demo's data model has).
async function getRescueTimeline() {
  const query = "from Pets select RescueDate, MedicalHistory, Vaccinations, AdoptionHistory";
  const result = await ravenFetch("/queries", { method: "POST", body: JSON.stringify({ Query: query }) });

  const rescues = {};
  const visits = {};
  const vaccinations = {};
  const adoptions = {};

  for (const pet of result.Results) {
    bumpMonth(rescues, monthKey(pet.RescueDate));
    for (const visit of pet.MedicalHistory || []) bumpMonth(visits, monthKey(visit.VisitDate));
    for (const vax of pet.Vaccinations || []) bumpMonth(vaccinations, monthKey(vax.DateAdministered));
    for (const application of pet.AdoptionHistory || []) {
      if (application.Status === "Approved") bumpMonth(adoptions, monthKey(application.DecisionDate));
    }
  }

  const months = Array.from(
    new Set([...Object.keys(rescues), ...Object.keys(visits), ...Object.keys(vaccinations), ...Object.keys(adoptions)])
  ).sort();

  return {
    months,
    rescues: months.map((m) => rescues[m] || 0),
    visits: months.map((m) => visits[m] || 0),
    vaccinations: months.map((m) => vaccinations[m] || 0),
    adoptions: months.map((m) => adoptions[m] || 0),
  };
}

module.exports = { getPetStats, searchAvailablePets, getTaskStates, toggleTask, getPulseSample, getRescueTimeline };
