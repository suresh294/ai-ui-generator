const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server");

const withServer = async (run) => {
    const server = app.listen(0);
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });

    try {
        await run(`http://127.0.0.1:${server.address().port}`);
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
    }
};

test("API root reports that the backend is running", async () => {
    await withServer(async (baseUrl) => {
        const response = await fetch(baseUrl);
        assert.equal(response.status, 200);
        assert.equal(await response.text(), "Backend Running");
    });
});

test("generation endpoint rejects a missing or invalid prompt without calling an LLM", async () => {
    await withServer(async (baseUrl) => {
        for (const body of [{}, { prompt: "   " }]) {
            const response = await fetch(`${baseUrl}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            assert.equal(response.status, 400);
            assert.deepEqual(await response.json(), { error: "Prompt is required" });
        }
    });
});
