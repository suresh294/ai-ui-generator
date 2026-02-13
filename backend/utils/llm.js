const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "AI UI Generator"
  }
});

async function callLLM(systemPrompt, userPrompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("Error calling OpenRouter:", error);
    throw new Error("Failed to communicate with AI agent");
  }
}

module.exports = { callLLM };
