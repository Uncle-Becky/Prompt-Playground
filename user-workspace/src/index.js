/**
 * Entry Point
 * This file initializes the generative model, sets global config, and calls runOrchestration.
 * Adjust the systemInstruction in model creation for your advanced prompt.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { runOrchestration } = require("./runOrchestration");

// Step 1: Setup your credentials
const apiKey = process.env.GEMINI_API_KEY;
if(!apiKey) {
  console.error("ERROR: Missing GEMINI_API_KEY environment variable.");
  process.exit(1);
}

// Step 2: Initialize the model with system instructions (like your advanced ToT prompt)
const genAI = new GoogleGenerativeAI(apiKey);

// Example system prompt
const systemInstruction = `# System Prompt:\nUse a tree-of-thought approach with multi-agents (Analyst, Critic, Visionary)...\n`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25",
  systemInstruction,
  tools: [
    // Provide a code execution tool if desired
    { codeExecution: {} },
  ],
});

// Step 3: Optional: Additional generation configuration
const generationConfig = {
  temperature: 0.65,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseMimeType: "text/plain",
};

// Step 4: Kick off the orchestration
(async () => {
  try {
    await runOrchestration(model, generationConfig);
  } catch (err) {
    console.error("Orchestration failed:", err);
  }
})();