const OpenAI = require("openai");

const getClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "AI UI Generator"
    }
  });
};

async function callLLM(systemPrompt, userPrompt) {
  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenRouter:", error.message || "Unknown error");
    throw new Error("Failed to communicate with AI agent");
  }
}

module.exports = { callLLM };
