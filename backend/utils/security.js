/**
 * Sanitizes the user prompt by checking for blocked keywords.
 * 
 * @param {string} prompt - The user provided prompt.
 * @returns {string} - The sanitized prompt if valid.
 * @throws {Error} - Throws an error if a blocked keyword is detected.
 */
const sanitizePrompt = (prompt) => {
    if (!prompt) return "";

    const blockedKeywords = [
        "ignore previous",
        "add new component",
        "create css",
        "tailwind",
        "inline style"
    ];

    const lowerPrompt = prompt.toLowerCase();

    for (const keyword of blockedKeywords) {
        if (lowerPrompt.includes(keyword.toLowerCase())) {
            throw new Error(`Blocked keyword detected: "${keyword}". Please avoid prompt injection or unauthorised styling requests.`);
        }
    }

    return prompt;
};

module.exports = {
    sanitizePrompt,
};
