/**
 * Logger interface for sync package
 * Allows dependency injection of any logger implementation
 * @example
 * // Using with NestJS Logger
 * const nestLogger = new Logger('SyncManager');
 * const syncManager = new SyncManager(userId, config, storage, {
 *   debug: (msg, ctx) => nestLogger.debug(msg, ctx),
 *   log: (msg, ctx) => nestLogger.log(msg, ctx),
 *   warn: (msg, ctx) => nestLogger.warn(msg, ctx),
 *   error: (msg, err, ctx) => nestLogger.error(msg, err?.stack, ctx),
 * });
 */
export interface ILogger {
    debug(message: string, context?: Record<string, unknown>): void;
    log(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

/**
 * Default console logger with structured JSON output
 * Used when no custom logger is provided
 */
export class ConsoleLogger implements ILogger {
    private readonly context: string;
    private readonly enabled: boolean;

    constructor(context: string = 'Sync', enabled: boolean = true) {
        this.context = context;
        this.enabled = enabled;
    }

    private formatOutput(
        level: string,
        message: string,
        context?: Record<string, unknown>,
        error?: Error
    ): string {
        const logObject = {
            timestamp: new Date().toISOString(),
            level,
            context: this.context,
            message,
            ...(context && Object.keys(context).length > 0 ? { data: context } : {}),
            ...(error ? { error: { name: error.name, message: error.message } } : {}),
        };
        return JSON.stringify(logObject);
    }

    debug(message: string, context?: Record<string, unknown>): void {
        if (!this.enabled) return;
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
            console.debug(this.formatOutput('DEBUG', message, context));
        }
    }

    log(message: string, context?: Record<string, unknown>): void {
        if (!this.enabled) return;
        console.log(this.formatOutput('INFO', message, context));
    }

    warn(message: string, context?: Record<string, unknown>): void {
        if (!this.enabled) return;
        console.warn(this.formatOutput('WARN', message, context));
    }

    error(message: string, error?: Error, context?: Record<string, unknown>): void {
        if (!this.enabled) return;
        console.error(this.formatOutput('ERROR', message, context, error));
        if (error?.stack && (process.env.NODE_ENV === 'development' || process.env.DEBUG)) {
            console.error(error.stack);
        }
    }
}

/**
 * No-op logger for testing or silent mode
 * All methods are empty - useful for unit tests
 */
export class NoopLogger implements ILogger {
    debug(_message: string, _context?: Record<string, unknown>): void {
        // Intentionally empty
    }
    log(_message: string, _context?: Record<string, unknown>): void {
        // Intentionally empty
    }
    warn(_message: string, _context?: Record<string, unknown>): void {
        // Intentionally empty
    }
    error(_message: string, _error?: Error, _context?: Record<string, unknown>): void {
        // Intentionally empty
    }
}

/**
 * Create a child logger with a new context
 * Useful for sub-components
 */
export function createChildLogger(parent: ILogger, childContext: string): ILogger {
    return {
        debug: (msg, ctx) => parent.debug(`[${childContext}] ${msg}`, ctx),
        log: (msg, ctx) => parent.log(`[${childContext}] ${msg}`, ctx),
        warn: (msg, ctx) => parent.warn(`[${childContext}] ${msg}`, ctx),
        error: (msg, err, ctx) => parent.error(`[${childContext}] ${msg}`, err, ctx),
    };
}
