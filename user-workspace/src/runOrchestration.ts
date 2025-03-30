import { GenerativeModel, GenerationConfig } from "@google/generative-ai";
import { Orchestrator } from "./orchestrator";

/**
 * This function can integrate your LLM model calls, or simply orchestrate the agents.
 */
export async function runOrchestration(model: GenerativeModel, config: GenerationConfig): Promise<string> {
  console.log("Starting Orchestration...\n");

  // You could do something with `model` or `config` here if desired.

  // Initialize and run orchestrator
  const orchestrator = new Orchestrator();
  await orchestrator.addFocus("Analyze this poem's structure and emotional tone");
  
  const results = orchestrator.getStatus();
  console.log("\n=== ORCHESTRATION COMPLETE ===\n");
  console.log(results);

  return JSON.stringify(results);
}