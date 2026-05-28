export type LogLevel = 'info' | 'warn' | 'error';

export interface DiagnosticLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string;
  message: string;
  context?: any;
}

class DiagnosticsLogger {
  private buffer: DiagnosticLog[] = [];
  private readonly MAX_LOGS = 20; // Keep it lightweight, bounded ring-buffer

  private pushLog(level: LogLevel, source: string, message: string, context?: any) {
    // We log it only in development, or keep it strictly client-memory safe
    // But we still want to record errors silently if in production without console spam,
    // so we can retrieve them via the hidden dump UI.
    
    // We will bypass actual console output in prod, but still keep the ring buffer
    // so the hidden debug UI can read it.
    
    const log: DiagnosticLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      level,
      source,
      message,
      // Stringify context safely to avoid memory leaks from huge objects
      context: context ? this.safeStringify(context) : undefined
    };

    this.buffer.unshift(log);
    
    if (this.buffer.length > this.MAX_LOGS) {
      this.buffer.pop();
    }
    
    // In dev, mirror to console for convenience
    if (process.env.NODE_ENV === 'development') {
      if (level === 'error') console.error(`[${source}] ${message}`, context || '');
      else if (level === 'warn') console.warn(`[${source}] ${message}`, context || '');
      else console.log(`[${source}] ${message}`, context || '');
    }
  }

  private safeStringify(obj: any): string {
    try {
      return JSON.stringify(obj, (key, value) => 
        typeof value === 'object' && value !== null
          ? (Array.isArray(value) ? `[Array(${value.length})]` : '[Object]')
          : value
      );
    } catch {
      return '[Unserializable]';
    }
  }

  public info(source: string, message: string, context?: any) {
    this.pushLog('info', source, message, context);
  }

  public warn(source: string, message: string, context?: any) {
    this.pushLog('warn', source, message, context);
  }

  public error(source: string, message: string, context?: any) {
    this.pushLog('error', source, message, context);
  }

  public getLogs(): DiagnosticLog[] {
    return [...this.buffer];
  }

  public clear() {
    this.buffer = [];
  }
}

export const diagnostics = new DiagnosticsLogger();
