/**
 * Centralized logging utility for Sitebango
 * Provides consistent logging across the application with proper error handling
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  subdomain?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    // In development, use console for better DX
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage, error);
          break;
        case 'error':
          console.error(formattedMessage, error);
          break;
      }
    } else {
      // In production, you could send to external service
      // For now, we'll use console but in a structured way
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : undefined
      };
      
      // This could be replaced with a service like Sentry, LogRocket, etc.
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.log('warn', message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  // Helper method for API errors
  apiError(endpoint: string, error: Error, context?: LogContext): void {
    this.error(`API Error: ${endpoint}`, {
      ...context,
      action: `api_${endpoint}`,
      metadata: {
        ...context?.metadata,
        endpoint
      }
    }, error);
  }

  // Helper method for auth errors
  authError(action: string, error: Error, context?: LogContext): void {
    this.error(`Auth Error: ${action}`, {
      ...context,
      action: `auth_${action}`,
    }, error);
  }

  // Helper method for integration errors
  integrationError(service: 'ghl' | 'gbp' | 'stripe', error: Error, context?: LogContext): void {
    this.error(`Integration Error: ${service}`, {
      ...context,
      action: `integration_${service}`,
      metadata: {
        ...context?.metadata,
        service
      }
    }, error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing or specific use cases
export { Logger, type LogLevel, type LogContext };