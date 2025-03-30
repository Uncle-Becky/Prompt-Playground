import { runAgent } from "./agent";
import { Branch } from "./branch";
import { AgentName } from "./memory";

/**
 * Gathers all agent branches, merges them into a final result.
 */
export function mergeResults(agentResults: Record<AgentName, Branch[]>) {
  const insights: string[] = [];

  for (const agent in agentResults) {
    const castAgent = agent as AgentName;
    const branches = agentResults[castAgent];
    for(const branch of branches) {
      if(branch.result) {
        insights.push(
          `[${agent}] => ${branch.result.insight}\n` +
          `ToolResult: ${JSON.stringify(branch.result.toolResult, null, 2)}`
        );
      }
    }
  }

  return insights.join("\n\n");
}

/**
 * Orchestrates the agents in parallel or sequence and merges results.
 */
export async function orchestrateAgents(agents: AgentName[] = ["Analyst", "Critic", "Visionary"]): Promise<string> {
  const agentResults: Record<AgentName, Branch[]> = {
    Analyst: [],
    Critic: [],
    Visionary: []
  };

  for(const agent of agents) {
    agentResults[agent] = await runAgent(agent);
  }

  const finalMerged = mergeResults(agentResults);
  return finalMerged;
}
