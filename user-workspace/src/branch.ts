import { toolRegistry } from "./tools";
import { AgentName, updateMemory } from "./memory";

/**
 * Represents one branch of reasoning.
 */
export class Branch {
  private agent: AgentName;
  private focus: string;
  private depth: number;
  public resolved: boolean;
  public result: { toolResult: any; insight: string } | null;

  constructor(agent: AgentName, focus: string, depth = 0) {
    this.agent = agent;
    this.focus = focus;
    this.depth = depth;
    this.resolved = false;
    this.result = null;
  }

  /**
   * Resolves this branch by:
   * 1) selecting a tool
   * 2) building arguments
   * 3) invoking the tool
   * 4) updating memory
   */
  public async resolve(): Promise<void> {
    console.log(`[${this.agent}] Resolving Branch: ${this.focus}, Depth: ${this.depth}`);

    // 1) Tool selection (naive approach)
    const toolName = this.selectTool();

    // 2) Build arguments
    const args = this.buildToolArgs(toolName);

    // 3) Invoke tool
    let toolResult: any;
    const tool = toolRegistry[toolName as keyof typeof toolRegistry];
    if (tool) {
      // Type-safe tool execution with proper argument casting
      switch (toolName) {
        case 'get_rhymes_and_near_rhymes':
          toolResult = await toolRegistry.get_rhymes_and_near_rhymes(args as GetRhymesArgs);
          break;
        case 'analyze_emotional_tone':
          toolResult = await toolRegistry.analyze_emotional_tone(args as AnalyzeToneArgs);
          break;
        case 'suggest_rhetorical_device':
          toolResult = await toolRegistry.suggest_rhetorical_device(args as SuggestDeviceArgs);
          break;
        default:
          toolResult = `Tool '${toolName}' not found`;
      }
    } else {
      toolResult = `Tool '${toolName}' not found`;
    }

    // 4) Store local result
    this.result = {
      toolResult,
      insight: `Resolved focus: ${this.focus} with tool: ${toolName}`
    };

    // 5) Update memory
    updateMemory(this.agent, {
      focus: this.focus,
      tool: toolName,
      args,
      result: toolResult,
      timestamp: Date.now()
    });

    this.resolved = true;
  }

  // Simple random selection from the tool registry
  private selectTool(): string {
    const tools = Object.keys(toolRegistry);
    const randIndex = Math.floor(Math.random() * tools.length);
    return tools[randIndex];
  }

  // Build naive argument sets.
  // In a real system, you'd tailor them to the focus.
  private buildToolArgs(toolName: string): Record<string, any> {
    switch(toolName) {
      case "get_rhymes_and_near_rhymes":
        return {
          word: "time",
          context_theme: "bittersweet memory",
          syllable_target: 1,
          rhyme_scheme_position: "B"
        };
      case "analyze_emotional_tone":
        return {
          text: "The wind whispers regret across empty halls.",
          expected_emotion: "nostalgia"
        };
      case "suggest_rhetorical_device":
        return {
          device_type: "metaphor",
          concept: "haunted by a distant voice",
          emotional_tone: "longing"
        };
      default:
        return {};
    }
  }
}