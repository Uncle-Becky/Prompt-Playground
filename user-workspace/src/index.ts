import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from "@google/generative-ai";
import { runOrchestration } from "./runOrchestration";

// 1) Retrieve API key from environment
const apiKey = process.env.GEMINI_API_KEY;
if(!apiKey) {
  console.error("ERROR: Missing GEMINI_API_KEY environment variable.");
  process.exit(1);
}

// 2) Instantiate the Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);

// 3) Example System Prompt + Tools
// Replace with your advanced Tree-of-Thought instructions
const systemInstruction = `# System Prompt:\nMulti-agent tree-of-thought orchestration...`;

// 4) Create a generative model instance
const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25",
  systemInstruction,
  tools: [
    { codeExecution: {} },
  ],
});

// 5) Optional Generation Config
const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 64,
  maxOutputTokens: 65536,
  responseMimeType: "text/plain",
};

// 6) Invoke the Orchestration
(async () => {
  try {
    await runOrchestration(model, generationConfig);
  } catch (err) {
    console.error("Orchestration Error:", err);
    process.exit(1);
  }
})();
