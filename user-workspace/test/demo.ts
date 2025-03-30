import { Orchestrator } from "../src/orchestrator";
import { Logger } from "../src/logger";

async function runDemo() {
  // Initialize logger
  const logger = Logger.getInstance();
  logger.setLogLevel('debug');

  // Create orchestrator
  const orchestrator = new Orchestrator();
  
  // Add sample focuses
  await orchestrator.addFocus("Analyze the emotional tone of this poem");
  await orchestrator.addFocus("Find rhyming patterns in this verse");
  await orchestrator.addFocus("Suggest rhetorical devices for this stanza");

  // Get and display results
  const results = orchestrator.getStatus();
  logger.log('linguistic', 'info', 'Orchestration completed', results);
}

runDemo().catch(err => {
  console.error('Demo failed:', err);
});