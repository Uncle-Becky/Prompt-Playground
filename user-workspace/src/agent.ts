import { Branch } from "./branch";
import { AgentName } from "./memory";

/**
 * Runs a single agent by spawning multiple branches.
 */
export async function runAgent(agent: AgentName) {
  // Example: 2 branches per agent
  const branches = [
    new Branch(agent, `Primary approach for ${agent}`, 0),
    new Branch(agent, `Secondary approach for ${agent}`, 1),
  ];

  // Resolve each branch
  for(const branch of branches) {
    await branch.resolve();
  }

  return branches;
}