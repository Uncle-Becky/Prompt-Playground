import { AgentName } from "./memory";

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public log(agent: AgentName, level: LogLevel, message: string, data?: any): void {
    if (this.shouldLog(level)) {
      const timestamp = new Date().toISOString();
      const logEntry = { timestamp, agent, level, message, data };
      console[level](JSON.stringify(logEntry, null, 2));
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level] >= levels[this.logLevel];
  }
}