import { Agent } from "./agent";
import { Logger } from "./logger";
import { AgentName } from "./memory";

export class Orchestrator {
  private agents: Map<AgentName, Agent> = new Map();
  private focusQueue: string[] = [];
  private isProcessing = false;

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    // Create agents with their specialized expertise
    this.agents.set('linguistic', new Agent('linguistic', 'language analysis'));
    this.agents.set('emotional', new Agent('emotional', 'emotional tone analysis'));
    this.agents.set('structural', new Agent('structural', 'composition structure'));
  }

  public async addFocus(focus: string): Promise<void> {
    this.focusQueue.push(focus);
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    const logger = Logger.getInstance();
    this.isProcessing = true;
    logger.log('orchestrator', 'info', 'Processing focus queue', { queueLength: this.focusQueue.length });
    
    while (this.focusQueue.length > 0) {
      const focus = this.focusQueue.shift()!;
      await this.distributeFocus(focus);
    }
    this.isProcessing = false;
  }

  private async distributeFocus(focus: string): Promise<void> {
    const agentPromises = Array.from(this.agents.values()).map(agent => 
      agent.processFocus(focus)
    );
    await Promise.all(agentPromises);
  }

  public getStatus() {
    return {
      queueLength: this.focusQueue.length,
      agents: Array.from(this.agents.values()).map(agent => agent.getStatus())
    };
  }
}
