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


// ============================================================================


// ============================================================================
//=== File: src/memory.js
/**
 * Memory management for the Tree-of-Thought system.
 * Agents store insights, partial solutions, or preferences here.
 */

const agentMemory = {
  Analyst: [],
  Critic: [],
  Visionary: []
};

/**
 * Add memory record for a specific agent
 * @param {string} agent - the agent name
 * @param {object} record - the memory record containing { focus, tool, args, result, timestamp }
 */
function updateMemory(agent, record) {
  if(!agentMemory[agent]) {
    agentMemory[agent] = [];
  }
  agentMemory[agent].push(record);
}

/**
 * Retrieve the entire memory for a specific agent
 * @param {string} agent
 * @returns {Array}
 */
function getAgentMemory(agent) {
  return agentMemory[agent] || [];
}

module.exports = {
  agentMemory,
  updateMemory,
  getAgentMemory
};