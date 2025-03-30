# Tree-of-Thought Orchestrator

An example multi-agent architecture harnessing Gemini 2.5 Pro, dynamic tool invocation, and memory-driven refinement for creative tasks like advanced lyric writing.

## Quick Start
1. Clone the repository or copy these files.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your `GEMINI_API_KEY` environment variable.
4. Run the orchestrator:
   ```bash
   npm start
   ```

## Directory Structure
- **src/index.js**: The entry point that sets up configuration and calls the orchestration.
- **src/orchestrator.js**: Coordinates agent parallelization and merges results.
- **src/memory.js**: Houses memory buffers and update logic.
- **src/tools.js**: Registry of tool functions.
- **src/branch.js**: Branch class that manages partial reasoning steps.
- **src/agent.js**: Agent logic (Analyst, Critic, Visionary) for spawning branches.
- **src/runOrchestration.js**: Contains the function that executes the entire tree-of-thought run.