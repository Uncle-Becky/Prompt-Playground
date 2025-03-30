# Tree-of-Thought Orchestrator

An example multi-agent architecture harnessing Gemini 2.5 Pro, dynamic tool invocation, and memory-driven refinement for creative tasks like advanced lyric writing.

# Tree-of-Thought Orchestrator (TypeScript)

An example multi-agent architecture leveraging Gemini 2.5 Pro, dynamic tools, and memory-based refinement. Written in TypeScript for clarity.

## Quick Start

1.  Copy these files into your project.
2.  `npm install` to install dependencies.
3.  Set your `GEMINI_API_KEY` environment variable.
4.  `npm run build` to compile the TS.
5.  `npm start` to run the orchestrator.

## Directory Structure
- **`src/index.ts`**: Entry point that initializes model & config, triggers orchestration.
- **`src/memory.ts`**: Agent memory handling.
- **`src/tools.ts`**: Tool registry.
- **`src/branch.ts`**: Branch class (reasoning steps, memory updates).
- **`src/agent.ts`**: Agent logic for spawning branches.
- **`src/orchestrator.ts`**: Coordinates multi-agent runs, merges outputs.
- **`src/runOrchestration.ts`**: Exposes a function that runs the entire pipeline.

// Usable Architecture in TypeScript

/**
 * For a TypeScript-based approach, place these files in a structure like:
 *
 * yourProject/
 *   ├─ package.json
 *   ├─ tsconfig.json
 *   ├─ README.md
 *   └─ src/
 *       ├─ index.ts
 *       ├─ orchestrator.ts
 *       ├─ memory.ts
 *       ├─ tools.ts
 *       ├─ branch.ts
 *       ├─ agent.ts
 *       └─ runOrchestration.ts
 *
 * Then run `npm install` and `npm run build` (or `npx tsc`) to compile.
 */

// ============================================================================