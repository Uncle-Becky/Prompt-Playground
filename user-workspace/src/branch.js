//=== File: src/branch.js
/**
 * Represents a single Branch of reasoning or exploration.
 * Each Branch belongs to one Agent, has a focus, can invoke exactly one tool, and updates memory.
 */

const { toolRegistry } = require("./tools");
const { updateMemory } = require("./memory");

class Branch {
  /**
   * @param {string} agent - agent name e.g. "Analyst", "Critic", "Visionary"
   * @param {string} focus - short description of the question or angle
   * @param {number} depth - branch depth, 0-based
   */
  constructor(agent, focus, depth = 0) {
    this.agent = agent;
    this.focus = focus;
    this.depth = depth;
    this.resolved = false;
    this.result = null;
  }

  /**
   * Resolves the branch by selecting a tool, building args, invoking it,
   * and storing the result in memory.
   */
  async resolve() {
    console.log(`[${this.agent}] Resolving Branch: ${this.focus}, Depth: ${this.depth}`);

    // 1) Select a tool (in a real system, you might pick based on focus or context)
    const toolName = this.selectTool();

    // 2) Build arguments for the tool
    const args = this.buildToolArgs(toolName);

    // 3) Invoke the tool
    let toolResult;
    if(toolRegistry[toolName]) {
      toolResult = await toolRegistry[toolName](args);
    } else {
      toolResult = `Tool '${toolName}' not found.`;
    }

    // 4) Store result
    this.result = {
      toolResult,
      insight: `Resolved focus: ${this.focus} with tool: ${toolName}`
    };

    // 5) Update Memory
    updateMemory(this.agent, {
      focus: this.focus,
      tool: toolName,
      args,
      result: toolResult,
      timestamp: Date.now()
    });

    // Mark as resolved
    this.resolved = true;
  }

  // === Example naive tool selection (random or simplistic) ===
  selectTool() {
    const tools = Object.keys(toolRegistry);
    const randomIndex = Math.floor(Math.random() * tools.length);
    return tools[randomIndex];
  }

  // === Example naive argument builder based on the tool name ===
  buildToolArgs(toolName) {
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

module.exports = {
  Branch
};