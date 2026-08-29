const { EMBEDDINGS_IDENTIFIER } = require("./embeddingsConfig");

const AGENT_NAME = "AdoptionConcierge";
const AGENT_IDENTIFIER = "adoption-concierge";

const SYSTEM_PROMPT = `
You are the Adoption Concierge for a veterinary clinic's pet shelter and adoption portal.
Your job is to have a warm, helpful conversation with a website visitor to help them find
the perfect pet to adopt, and to register their interest once they've decided.

Use the search_available_pets tool to find pets that match what the visitor describes
(temperament, size, energy level, compatibility with kids or other pets, etc.) — always
search rather than guessing, and only ever mention or recommend pets that the tool actually
returned. The tool only returns pets currently available for adoption, so never suggest a pet
it didn't return.

Every result also includes real vaccination and medical history data: "isVaccinated",
"vaccinationCount", "lastVaccineName", and "medicalVisitCount". This is actual clinic data, not
a guess — if a visitor asks whether a pet is vaccinated or has seen a vet, answer confidently and
directly from these fields (e.g. "yes, Bela is vaccinated — she's had her Rabies shot" or "Bolt
hasn't had any vaccinations recorded yet"). Never say you can't confirm this; the data is right
there in the tool result.

When the visitor decides on a pet and wants to register interest, ask for their full name and
at least one way to reach them (email or phone) if you don't already have it, then call the
register_adoption_interest tool with those details plus a short note summarizing why this pet
is a good fit. Confirm clearly to the visitor once it's done, and mention that the shelter team
will follow up.

Keep your tone warm, concise, and honest. Never invent details about a specific pet beyond what
the tools return.

Always format your reply as Markdown: use **bold** for pet names and key facts, bullet or numbered
lists when listing multiple pets or options, and short paragraphs. This makes the conversation
easier to read and feel more like a real concierge, not a wall of text.
`.trim();

const RESPONSE_SAMPLE = {
  reply: "your conversational reply to the visitor, in the same language they wrote in",
};

// A JS projection (not a plain field list) so vaccination/medical history —
// real clinic data embedded on the pet, not AI-generated — can be summarized
// into flat fields the model can answer from directly and confidently.
const SEARCH_QUERY = `
from Pets as p
where vector.search(embedding.text(p.AI.FullDescription, ai.task('${EMBEDDINGS_IDENTIFIER}')), $description, 0.6)
  and p.Status in ('InShelter', 'PendingAdoption')
select {
    Name: p.Name,
    Species: p.Species,
    Breed: p.Breed,
    Sex: p.Sex,
    Status: p.Status,
    PetId: p.PetId,
    AdoptionBio: p.AI.AdoptionBio,
    TemperamentTags: p.AI.TemperamentTags,
    isVaccinated: p.Vaccinations && p.Vaccinations.length > 0,
    vaccinationCount: p.Vaccinations ? p.Vaccinations.length : 0,
    lastVaccineName: p.Vaccinations && p.Vaccinations.length ? p.Vaccinations[p.Vaccinations.length - 1].VaccineName : null,
    medicalVisitCount: p.MedicalHistory ? p.MedicalHistory.length : 0
}
`.trim();

function buildAgentConfig(connectionStringName) {
  return {
    name: AGENT_NAME,
    identifier: AGENT_IDENTIFIER,
    connectionStringName,
    systemPrompt: SYSTEM_PROMPT,
    disabled: false,
    sampleObject: JSON.stringify(RESPONSE_SAMPLE),
    maxModelIterationsPerCall: 6,
    queries: [
      {
        name: "search_available_pets",
        description:
          "Searches pets currently available for adoption by semantic similarity to a natural-language " +
          "description of what the visitor is looking for (temperament, size, energy, compatibility, etc.). " +
          "Always use this instead of guessing which pets exist.",
        query: SEARCH_QUERY,
        parametersSampleObject: JSON.stringify({
          description: "a natural-language description of what kind of pet the visitor wants, e.g. 'calm dog, good with kids, small breed'",
        }),
      },
    ],
    actions: [
      {
        name: "register_adoption_interest",
        description:
          "Registers the visitor's interest in adopting a specific pet. Only call this after the visitor has " +
          "explicitly confirmed they want to proceed AND you have their name and at least one contact method.",
        parametersSampleObject: JSON.stringify({
          petId: "the numeric PetId of the pet, from a previous search_available_pets result",
          petName: "the pet's name, from a previous search_available_pets result",
          applicantName: "the visitor's full name",
          applicantEmail: "the visitor's email address, or an empty string if not given",
          applicantPhone: "the visitor's phone number, or an empty string if not given",
          notes: "a short note summarizing why this pet is a good fit, based on the conversation",
        }),
      },
    ],
  };
}

module.exports = { AGENT_NAME, AGENT_IDENTIFIER, buildAgentConfig };
