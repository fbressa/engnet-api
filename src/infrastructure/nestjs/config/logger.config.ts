import { Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomLogger implements LoggerService {
  private logDir = 'logs';

  constructor() {
    this.createLogsDirectory();
  }

  private createLogsDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(context: string, message: string, level: string): string {
    return `[${this.getTimestamp()}] [${level.toUpperCase()}] [${context}] ${message}`;
  }

  private writeToFile(logMessage: string): void {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `${date}.log`);

    fs.appendFileSync(logFile, logMessage + '\n');
  }

  log(message: string, context?: string): void {
    const logMessage = this.formatLog(context || 'APP', message, 'log');
    console.log(logMessage);
    this.writeToFile(logMessage);
  }

  error(message: string, trace?: string, context?: string): void {
    const logMessage = this.formatLog(context || 'ERROR', message, 'error');
    console.error(logMessage);
    if (trace) {
      console.error(trace);
      this.writeToFile(`${logMessage}\nStack: ${trace}`);
    } else {
      this.writeToFile(logMessage);
    }
  }

  warn(message: string, context?: string): void {
    const logMessage = this.formatLog(context || 'WARN', message, 'warn');
    console.warn(logMessage);
    this.writeToFile(logMessage);
  }

  debug(message: string, context?: string): void {
    const logMessage = this.formatLog(context || 'DEBUG', message, 'debug');
    console.debug(logMessage);
    this.writeToFile(logMessage);
  }

  verbose(message: string, context?: string): void {
    const logMessage = this.formatLog(context || 'VERBOSE', message, 'verbose');
    console.log(logMessage);
    this.writeToFile(logMessage);
  }
}
