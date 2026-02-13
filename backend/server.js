require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { plannerAgent } = require("./agents/planner");
const { generatorAgent } = require("./agents/generator");
const { designerAgent } = require("./agents/designer");
const { explainerAgent } = require("./agents/explainer");


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.post("/generate", async (req, res) => {
    try {
        const { prompt, previousCode } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // 1. Call planner agent (pass previousCode if it's a modification)
        const plan = await plannerAgent(prompt, previousCode);

        // 2. Call generator agent (pass previousCode to modify existing content)
        const rawCode = await generatorAgent(plan, previousCode);

        // 3. Call designer agent to wrap/style the code using the plan
        const fullCode = await designerAgent(plan, rawCode);

        // 4. Call explainer agent
        const explanation = await explainerAgent(plan, fullCode);

        // EXTRA: Clean code for the frontend editor (strip markers and boilerplate)
        let editorCode = fullCode;
        if (fullCode.includes('/* UI_CONTENT_START */')) {
            const match = fullCode.match(/\/\* UI_CONTENT_START \*\/([\s\S]*?)\/\* UI_CONTENT_END \*\//);
            if (match) {
                editorCode = match[1].trim();
            }
        }

        // Return the combined result
        res.json({
            plan,
            code: editorCode, // Send clean code to editor
            fullCode,         // Keep full code for internal use/preview if needed
            explanation,
        });
    } catch (error) {
        console.error("Error in /generate route:", error);

        // Return a structured error response
        const errorMessage = error.message || "Internal Server Error";
        res.status(500).json({
            error: errorMessage,
            type: "GENERATION_ERROR"
        });
    }
});




// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
