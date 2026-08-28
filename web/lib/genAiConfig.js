const { GenAiConfiguration, GenAiTransformation } = require("ravendb");

const GENAI_TASK_NAME = "PetAdoptionEnrichment";
const GENAI_IDENTIFIER = "pet-adoption-enrichment";

// Only pets that could plausibly be adopted get enriched — Owned/ClinicPatient
// pets never appear on the portal, so there's no reason to spend AI tokens on them.
const CONTEXT_SCRIPT = `
if (this.Origin === 'Rescued') {
    ai.genContext({
        Name: this.Name,
        Species: this.Species,
        Breed: this.Breed,
        Sex: this.Sex,
        Status: this.Status,
        IntakeNotes: this.IntakeNotes,
        VaccinationCount: this.Vaccinations ? this.Vaccinations.length : 0,
        MedicalVisitCount: this.MedicalHistory ? this.MedicalHistory.length : 0
    });
}
`.trim();

const PROMPT = `
You are writing content for a pet adoption website run by a veterinary clinic and shelter.
Given a shelter pet's basic facts (name, species, breed, sex, status, raw staff intake notes,
vaccination and medical visit counts), do three things:

1. Write "adoptionBio": a warm, honest, 2-4 sentence adoption bio that would make a potential
   adopter want to meet this pet. Base it only on the given facts — never invent specific
   incidents, people, or events that weren't mentioned.
2. Extract "temperamentTags": an array of temperament tags, choosing only from this fixed set:
   Calm, Energetic, GoodWithKids, GoodWithOtherDogs, GoodWithCats, ApartmentFriendly, NeedsSpace,
   Affectionate, Independent, Timid, Playful. Include a tag only if the intake notes genuinely
   support it — an empty array is fine if nothing can be inferred.
3. Write "fullDescription": one rich paragraph combining the pet's name, species, breed, the
   adoption bio, and the temperament tags into natural language — this is the field a semantic
   search engine will match against, so make it descriptive and information-dense.
`.trim();

const SAMPLE_RESPONSE = {
  adoptionBio: "a warm 2-4 sentence adoption bio",
  temperamentTags: ["Calm", "GoodWithKids"],
  fullDescription: "a rich paragraph combining name, species, breed, bio and temperament tags",
};

// Uses the "this" (document) / "$output" (model response) convention shared
// by CDC Sink and SQL ETL patch scripts elsewhere in RavenDB — not the
// "function update(doc, result) {...return doc}" form the client's own
// JSDoc comment suggests, which turned out not to be what the server
// actually invokes (confirmed empirically: that form left @gen-ai-hashes
// recorded but no AI.* fields written, with no error surfaced anywhere).
const UPDATE_SCRIPT = `
this.AI = this.AI || {};
this.AI.AdoptionBio = $output.adoptionBio;
this.AI.TemperamentTags = $output.temperamentTags;
this.AI.FullDescription = $output.fullDescription;
`.trim();

function buildGenAiConfig(connectionStringName) {
  const config = new GenAiConfiguration();
  config.name = GENAI_TASK_NAME;
  config.identifier = GENAI_IDENTIFIER;
  config.connectionStringName = connectionStringName;
  config.collection = "Pets";
  config.disabled = false;
  config.maxConcurrency = 4;
  config.queries = [];
  config.enableTracing = false;

  config.genAiTransformation = new GenAiTransformation();
  config.genAiTransformation.script = CONTEXT_SCRIPT;

  config.prompt = PROMPT;
  config.sampleObject = JSON.stringify(SAMPLE_RESPONSE);
  config.updateScript = UPDATE_SCRIPT;

  return config;
}

module.exports = { GENAI_TASK_NAME, GENAI_IDENTIFIER, buildGenAiConfig };
