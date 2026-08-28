const { EmbeddingsGenerationConfiguration } = require("ravendb");

const EMBEDDINGS_TASK_NAME = "PetDescriptionEmbeddings";
const EMBEDDINGS_IDENTIFIER = "pet-description-embeddings";

// Vectorizes AI.FullDescription — the field the GenAI task (see genAiConfig.js)
// composes from the pet's facts + AI-written bio + temperament tags. This task
// only ever has something to do once that field exists, so it naturally chains
// after GenAI enrichment without any explicit ordering/dependency wiring.
function buildEmbeddingsConfig(connectionStringName) {
  const config = new EmbeddingsGenerationConfiguration();
  config.name = EMBEDDINGS_TASK_NAME;
  config.identifier = EMBEDDINGS_IDENTIFIER;
  config.connectionStringName = connectionStringName;
  config.collection = "Pets";
  config.disabled = false;
  config.quantization = "Single";

  config.embeddingsPathConfigurations = [
    {
      path: "AI.FullDescription",
      chunkingOptions: {
        chunkingMethod: "PlainTextSplitParagraphs",
        maxTokensPerChunk: 512,
        overlapTokens: 64,
      },
    },
  ];

  config.chunkingOptionsForQuerying = {
    chunkingMethod: "PlainTextSplit",
    maxTokensPerChunk: 512,
    overlapTokens: 0,
  };

  return config;
}

module.exports = { EMBEDDINGS_TASK_NAME, EMBEDDINGS_IDENTIFIER, buildEmbeddingsConfig };
