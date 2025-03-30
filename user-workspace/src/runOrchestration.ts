import { GenerativeModel, GenerationConfig } from "@google/generative-ai";
import { orchestrateAgents } from "./orchestrator";

/**
 * This function can integrate your LLM model calls, or simply orchestrate the agents.
 */
export async function runOrchestration(model: GenerativeModel, config: GenerationConfig): Promise<string> {
  console.log("Starting Orchestration...\n");

  // You could do something with `model` or `config` here if desired.

  // For now, we just orchestrate.
  const finalMerged = await orchestrateAgents();

  console.log("\n=== FINAL MERGED RESULTS ===\n");
  console.log(finalMerged);

  return finalMerged;
}