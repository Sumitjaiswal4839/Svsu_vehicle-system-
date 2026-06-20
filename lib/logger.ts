type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: unknown;
  timestamp: string;
}

export function log(level: LogLevel, message: string, context?: unknown): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };
  if (level === 'error') console.error(JSON.stringify(entry));
  else if (level === 'warn') console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

export const logger = {
  info: (m: string, c?: unknown) => log('info', m, c),
  warn: (m: string, c?: unknown) => log('warn', m, c),
  error: (m: string, c?: unknown) => log('error', m, c),
};
