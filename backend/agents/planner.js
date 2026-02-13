const { callLLM } = require("../utils/llm");

const SYSTEM_PROMPT = `You are a Senior Full-Stack Architect and UI Planner.
Your goal is to transform user requests into high-fidelity, deterministic UI plans.

Allowed Components:
Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart.

Architectural Constraints:
1. Choose "layout":
   - "dashboard": Systems, Admin panels, multi-page data views.
   - "centered": Landing pages, auth forms, single utilities.
2. Choose "layoutPattern" (Internal content arrangement):
   - "stack": Single column vertical stack.
   - "grid": Multi-column responsive grid (best for summaries/cards).
   - "split": Balanced two-column layout (form/text on one side, data/image on other).
3. Sidebar & Navbar: Always populate with logical navigation for the requested context.

Output Format:
Return ONLY a valid JSON object. No markdown. No jokes. No trailing commas.

JSON Schema:
{
  "layout": "dashboard" | "centered",
  "layoutPattern": "stack" | "grid" | "split",
  "sidebar": [ { "label": "String", "link": "#" } ],
  "navbar": [ { "label": "String", "url": "#" } ],
  "components": [
    { "type": "ComponentName", "props": { ... } }
  ]
}

MODIFICATION MODE:
If "previousCode" is provided, analyze it and the new request. Transform ONLY what is necessary to meet the user's evolution while preserving layout integrity.`;

/**
 * Extracts the UIContent logic using markers.
 */
function unwrapCode(code) {
  if (!code) return null;

  const match = code.match(/\/\* UI_CONTENT_START \*\/([\s\S]*?)\/\* UI_CONTENT_END \*\//);
  if (match) {
    return match[1].trim().replace(/function\s+UIContent/g, "export default function UIContent");
  }

  // Fallback to function body extraction for old code
  const oldMatch = code.match(/function\s+UIContent\s*\(\)\s*\{([\s\S]*?)\n\}/);
  if (oldMatch) {
    return `export default function UIContent() {${oldMatch[1]}\n}`;
  }

  return code;
}

/**
 * Refined Planner Agent function using OpenAI helper.
 * Supports Modification Mode if previousCode is provided.
 */
const plannerAgent = async (description, previousCode = null) => {
  try {
    let userPrompt = description;
    const contextCode = unwrapCode(previousCode);

    if (contextCode) {
      userPrompt = `MODIFICATION MODE:
Existing UI Code:
${contextCode}

User Request:
${description}`;
    }

    const response = await callLLM(SYSTEM_PROMPT, userPrompt);

    // More robust JSON extraction
    let jsonString = response.trim();

    // 1. Remove markdown backticks if any
    jsonString = jsonString.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    // 2. Find the first '{' and last '}'
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

    // 3. Remove single-line comments // ONLY if they have a space before them (or start of line)
    // This avoids breaking URLs like https://
    jsonString = jsonString.replace(/(^|\s)\/\/.*/g, '$1');

    // 4. Remove multi-line comments /* */
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');

    // 5. Remove potential trailing commas before closing braces/brackets
    jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');

    const parsedPlan = JSON.parse(jsonString);

    // Basic validation of the internal structure
    if (!parsedPlan.layout || !Array.isArray(parsedPlan.components)) {
      throw new Error("Invalid plan format received from AI.");
    }

    return parsedPlan;
  } catch (error) {
    console.error("Planner Agent Error:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse AI response as valid JSON.");
    }
    throw error;
  }
};

module.exports = {
  plannerAgent,
};
