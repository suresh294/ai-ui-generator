const { callLLM } = require("../utils/llm");

async function explainerAgent(plan) {
  const systemPrompt = `
You are a UI design explainer.

Explain:
- Why each component was selected
- Why the layout was structured that way
- Keep explanation simple
- 4-6 sentences
- No code
`;

  const userPrompt = JSON.stringify(plan);

  const raw = await callLLM(systemPrompt, userPrompt);

  return raw.trim();
}

module.exports = { explainerAgent };
