import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(process.cwd(), '.env') });

interface ToolDefaults {
  maxRetries: number;
  timeout: number;
}

interface Config {
  apiKey: string;
  toolDefaults: ToolDefaults;
  env: 'development' | 'production';
}

export const config: Config = {
  apiKey: process.env.GEMINI_API_KEY || '',
  toolDefaults: {
    maxRetries: 3,
    timeout: 5000
  },
  env: process.env.NODE_ENV === 'production' ? 'production' : 'development'
};

export function validateConfig(): void {
  if (!config.apiKey) {
    throw new Error('Missing required GEMINI_API_KEY in environment variables');
  }
}
