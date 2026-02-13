/**
 * Designer Agent
 * ----------------------------------------------------
 * Deterministic layout assembler.
 * NO LLM CALLS.
 * NO dynamic styling.
 * NO inline styles.
 *
 * Responsibilities:
 * - Wrap generator output inside fixed app layout
 * - Inject sidebar + navbar from planner
 * - Enforce fixed structural composition
 * - Keep component system deterministic
 */

function sanitizeContent(code) {
    if (!code || typeof code !== "string") return "";

    // Remove any export default wrapper and ensure it's a named function UIContent()
    // This version is robust against optional line breaks and missing parentheses.
    let cleaned = code
        .replace(/export\s+default\s+function\s+(?:UIContent|GeneratedUI)(?:\s*\([^)]*\))?/g, "function UIContent()");

    return cleaned.trim();
}

function designerAgent(plan, contentCode) {
    try {
        const cleanedContent = sanitizeContent(contentCode);
        const layout = plan?.layout || "dashboard";
        const layoutPattern = plan?.layoutPattern || "stack";

        // Extract deterministic layout data from plan
        const sidebarItems = Array.isArray(plan?.sidebar) ? plan.sidebar : [];
        const navbarLinks = Array.isArray(plan?.navbar) ? plan.navbar : [];

        // Define the content shell using system-controlled layout patterns
        const contentContainer = `
        <div className="layout-${layoutPattern}">
          <UIContent />
        </div>`.trim();

        let shellCode = "";

        if (layout === "centered") {
            shellCode = `
    <div className="component-centered-wrapper">
      ${contentContainer}
    </div>`;
        } else {
            shellCode = `
    <div className="component-app-wrapper">
      <Sidebar items={${JSON.stringify(sidebarItems)}} />
      <div className="component-main-content">
        <Navbar links={${JSON.stringify(navbarLinks)}} />
        <div className="component-page-content">
          ${contentContainer}
        </div>
      </div>
    </div>`;
        }

        // Strict deterministic layout structure
        const finalCode = `
function UIContentFallback() {
  return null;
}

/* --- THE CONTENT COMPONENT --- */
/* UI_CONTENT_START */
${cleanedContent || "function UIContent() { return <UIContentFallback />; }"}
/* UI_CONTENT_END */

export default function GeneratedUI() {
  return (
    ${shellCode}
  );
}
`.trim();

        return finalCode;
    } catch (error) {
        console.error("Designer Agent Error:", error);

        // Safe fallback layout (still deterministic)
        return `
export default function GeneratedUI() {
  return (
    <div className="component-app-wrapper">
      <div className="component-main-content">
        <div className="component-page-content">
          <div>Error rendering UI</div>
        </div>
      </div>
    </div>
  );
}
    `.trim();
    }
}

module.exports = { designerAgent };
