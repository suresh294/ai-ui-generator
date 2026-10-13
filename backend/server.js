require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { plannerAgent } = require("./agents/planner");
const { generatorAgent } = require("./agents/generator");
const { designerAgent } = require("./agents/designer");
const { explainerAgent } = require("./agents/explainer");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.post("/generate", async (req, res) => {
    try {
        const { prompt, previousCode } = req.body || {};

        if (typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const plan = await plannerAgent(prompt, previousCode);
        const rawCode = await generatorAgent(plan, previousCode);
        const fullCode = await designerAgent(plan, rawCode);
        const explanation = await explainerAgent(plan, fullCode);

        let editorCode = fullCode;
        if (fullCode.includes("/* UI_CONTENT_START */")) {
            const match = fullCode.match(/\/\* UI_CONTENT_START \*\/([\s\S]*?)\/\* UI_CONTENT_END \*\//);
            if (match) editorCode = match[1].trim();
        }

        return res.json({
            plan,
            code: editorCode,
            fullCode,
            explanation,
        });
    } catch (error) {
        console.error("Error in /generate route:", error.message || "Unknown error");
        return res.status(500).json({
            error: "UI generation failed. Check the server configuration and try again.",
            type: "GENERATION_ERROR"
        });
    }
});

if (require.main === module) {
    const port = Number.parseInt(process.env.PORT || "5000", 10);
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

module.exports = app;
