export type MemoryRecord = {
  focus: string;
  tool: string;
  args: Record<string, any>;
  result: any;
  timestamp: number;
};

// Agents
export type AgentName = "linguistic" | "emotional" | "structural" | "orchestrator";

// In-memory storage
const agentMemory: Record<AgentName, MemoryRecord[]> = {
  linguistic: [],
  emotional: [],
  structural: [],
  orchestrator: [],
};

/**
 * Add a memory record for the specified agent.
 */
export function updateMemory(agent: AgentName, record: MemoryRecord): void {
  agentMemory[agent].push(record);
}

/**
 * Retrieve the entire memory for the specified agent.
 */
export function getAgentMemory(agent: AgentName): MemoryRecord[] {
  return agentMemory[agent];
}