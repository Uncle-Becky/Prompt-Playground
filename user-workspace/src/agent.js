//=== File: src/agent.js
/**
 * Agent logic: Each agent can spawn multiple branches.
 * Future expansions: Agents can differ in how they build branches.
 */

const { Branch } = require("./branch");

async function runAgent(agent) {
  // Basic example: Two branches per agent
  const branches = [
    new Branch(agent, `Primary approach from ${agent}`, 0),
    new Branch(agent, `Secondary angle from ${agent}`, 1)
  ];

  // Resolve each branch in sequence
  for(const branch of branches) {
    await branch.resolve();
  }

  return branches;
}

module.exports = {
  runAgent
};