const { AiConversationCreationOptions } = require("ravendb");
const { getStore } = require("../lib/ravenStore");
const { AGENT_IDENTIFIER } = require("../lib/agentConfig");

const CONVERSATION_PREFIX = "AdoptionChats/";

// App-level toggle: the AI Agent has no "ongoing task" state to enable/disable
// like CDC Sink/GenAI/Embeddings do (it's invoked per-conversation, not
// running continuously), so "turning it off" means this backend refuses new
// messages until turned back on.
let agentEnabled = true;
let cumulativeTokensUsed = 0;

function isAgentEnabled() {
  return agentEnabled;
}

function setAgentEnabled(value) {
  agentEnabled = Boolean(value);
  return agentEnabled;
}

function getCumulativeTokensUsed() {
  return cumulativeTokensUsed;
}

async function sendMessage(clientConversationId, userMessage) {
  if (!agentEnabled) {
    const err = new Error("The adoption concierge is currently turned off.");
    err.status = 409;
    throw err;
  }

  const store = getStore();
  const conversationId = clientConversationId
    ? `${CONVERSATION_PREFIX}${clientConversationId}`
    : `${CONVERSATION_PREFIX}`;

  const chat = store.ai.conversation(AGENT_IDENTIFIER, conversationId, new AiConversationCreationOptions());

  let tokensUsed = 0;

  chat.handle("register_adoption_interest", async (args) => {
    const session = store.openSession();
    const interest = {
      PetId: Number(args.petId),
      PetName: args.petName || null,
      ApplicantName: args.applicantName,
      ApplicantEmail: args.applicantEmail || null,
      ApplicantPhone: args.applicantPhone || null,
      Notes: args.notes || null,
      CreatedAt: new Date().toISOString(),
    };
    await session.store(interest, "AdoptionInterests/");
    session.advanced.getMetadataFor(interest)["@collection"] = "AdoptionInterests";
    await session.saveChanges();
    return "registered";
  });

  chat.setUserPrompt(userMessage);
  const result = await chat.run();

  if (result.usage) {
    tokensUsed = result.usage.totalTokens || 0;
    cumulativeTokensUsed += tokensUsed;
  }

  return {
    reply: result.answer ? result.answer.reply : null,
    status: result.status,
    tokensUsed,
    conversationId: chat.id ? chat.id.replace(CONVERSATION_PREFIX, "") : clientConversationId,
  };
}

module.exports = { sendMessage, isAgentEnabled, setAgentEnabled, getCumulativeTokensUsed };
