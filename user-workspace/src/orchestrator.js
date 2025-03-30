//=== File: src/orchestrator.js
/**
 * Coordinates parallel agent runs and merges their results.
 */
const { runAgent } = require("./agent");

/**
 * Merges agent results into a final string or object.
 */
function mergeResults(agentResults) {
  // Flatten all resolved branches from all agents
  const insights = [];
  for(const agent in agentResults) {
    for(const branch of agentResults[agent]) {
      const { toolResult, insight } = branch.result;
      insights.push(`[${agent}] => ${insight}\nToolResult: ${JSON.stringify(toolResult)}`);
    }
  }
  return insights.join("\n\n");
}

/**
 * The main orchestrator function.
 * Loops over agents, runs them, merges results.
 */
async function orchestrateAgents(agents = ["Analyst", "Critic", "Visionary"]) {
  const agentResults = {};
  for(const agent of agents) {
    agentResults[agent] = await runAgent(agent);
  }
  const finalMerged = mergeResults(agentResults);
  return finalMerged;
}

module.exports = {
  orchestrateAgents,
  mergeResults
};