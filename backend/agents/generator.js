const { callLLM } = require("../utils/llm");

/**
 * Strict component whitelist
 */
const ALLOWED_COMPONENTS = [
  "Button", "Card", "Input", "Table", "Modal", "Chart",
  "UIContent", "GeneratedUI"
];

const SYSTEM_PROMPT = `You are a PRO-LEVEL React UI content generator.

Architectural Rules:
- Generate ONLY a single React function named "UIContent()".
- Strictly return raw content components.
- FORBIDDEN: Any layout wrappers like <div> with flex/grid, className="flex", etc.
- FORBIDDEN: Custom CSS or inline style={{...}}.
- FORBIDDEN: Sidebar, Navbar, or external imports.
- COMPOSITION: Return components flat or wrapped in a Fragment (<>...</>).
- WHILTESLIST: Button, Card, Input, Table, Modal, Chart.

PRO-TIP:
- For Card, use actual children inside: <Card title="X"><Input /><Button /></Card>.
- Do not pass components as props.
- Focus on clean, modular component orchestration.

Return ONLY the code. No markdown backticks. No explanation.`;

const { validateGeneratedCode } = require("../utils/validator");

function unwrapCode(code) {
  if (!code) return null;

  const match = code.match(/\/\* UI_CONTENT_START \*\/([\s\S]*?)\/\* UI_CONTENT_END \*\//);
  if (match) {
    return match[1].trim().replace(/function\s+UIContent/g, "export default function UIContent");
  }

  // Fallback to function block extraction
  const oldMatch = code.match(/function\s+UIContent\s*\(\)\s*\{([\s\S]*?)\n\}/);
  if (oldMatch) {
    return `export default function UIContent() {${oldMatch[1]}\n}`;
  }

  return code;
}

/**
 * Generator Agent
 */
const generatorAgent = async (plan, previousCode = null) => {
  try {
    const contextCode = unwrapCode(previousCode);
    let userPrompt = contextCode
      ? `MODIFICATION MODE.\nExisting UIContent:\n${contextCode}\nUpdate per PLAN:\n${JSON.stringify(plan, null, 2)}`
      : `Generate UIContent using this PLAN:\n${JSON.stringify(plan, null, 2)}`;

    const response = await callLLM(SYSTEM_PROMPT, userPrompt);
    let code = response.trim().replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/g, "").trim();

    // Force rename if needed
    code = code.replace(/export default function GeneratedUI/g, "export default function UIContent");

    const validationError = validateGeneratedCode(code);
    if (validationError) {
      throw new Error(validationError);
    }
    return code;
  } catch (error) {
    console.error("Generator Agent Error:", error);
    throw error;
  }
};

module.exports = { generatorAgent };
