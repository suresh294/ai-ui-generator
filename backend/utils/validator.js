/**
 * Validates generated React code against a whitelist of allowed components
 * and ensures no forbidden patterns (like inline dynamic styles) are present.
 * 
 * @param {string} code - The React component code string to validate.
 * @returns {boolean} - Returns true if valid.
 * @throws {Error} - Throws an error if a non-whitelisted component or pattern is detected.
 */
const ALLOWED_COMPONENTS = [
    "Button", "Card", "Input", "Table", "Modal", "Sidebar", "Navbar", "Chart", "UIContent", "GeneratedUI"
];

const validateGeneratedCode = (code) => {
    if (!code || typeof code !== "string") return "Empty code received.";

    // 1. Block imports (prevents AI from injecting external scripts)
    if (code.includes("import ") || code.includes("require(")) {
        return "Imports are forbidden in generated code.";
    }

    // 2. Block 'style' prop (prevents AI from defining its own styles)
    // Matching style={{ or style= {{
    if (/style\s*=\s*\{\{/i.test(code)) {
        return "Inline styles are forbidden. Use system components.";
    }

    // 3. Block styled-components or backtick-based CSS
    if (code.includes("styled.") || /`[\s\S]*?\{[\s\S]*?\}/.test(code)) {
        return "Custom styled-components or CSS-in-JS is not allowed.";
    }

    // 4. Component Whitelist Check
    const componentMatches = code.match(/<([A-Z][a-zA-Z0-9]*)/g) || [];
    for (const match of componentMatches) {
        const componentName = match.substring(1);
        if (!ALLOWED_COMPONENTS.includes(componentName)) {
            return `Forbidden component: <${componentName}>. Only use allowed system components.`;
        }
    }

    // 5. Enforce required function name
    if (!code.includes("function UIContent")) {
        return "Generated code must contain 'function UIContent()'.";
    }

    return null; // All checks passed
};

module.exports = {
    validateGeneratedCode,
};
