import { Branch } from "./branch";
import { AgentName } from "./memory";
import { updateMemory } from "./memory";

export class Agent {
  private name: AgentName;
  private expertise: string;
  private maxDepth: number;
  private currentBranches: Branch[] = [];

  constructor(name: AgentName, expertise: string, maxDepth = 3) {
    this.name = name;
    this.expertise = expertise;
    this.maxDepth = maxDepth;
  }

  public async processFocus(focus: string, depth = 0): Promise<void> {
    if (depth > this.maxDepth) {
      return;
    }

    const branch = new Branch(this.name, focus, depth);
    this.currentBranches.push(branch);
    
    try {
      await branch.resolve();
      
      // Process child branches if needed
      if (branch.result && typeof branch.result.toolResult === 'object') {
        for (const subFocus of this.getSubFocuses(branch.result.toolResult)) {
          await this.processFocus(subFocus, depth + 1);
        }
      }
    } catch (error) {
      console.error(`[${this.name}] Error processing focus: ${focus}`, error);
    } finally {
      this.currentBranches = this.currentBranches.filter(b => b !== branch);
    }
  }

  private getSubFocuses(toolResult: any): string[] {
    // Implement logic to extract sub-focuses from tool results
    return [];
  }

  public getStatus() {
    return {
      name: this.name,
      currentBranches: this.currentBranches.length,
      maxDepth: this.maxDepth
    };
  }
}