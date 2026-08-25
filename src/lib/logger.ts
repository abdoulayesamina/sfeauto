// Structured error logging utility
// Provides consistent, searchable error logs with context

export function logError(
  message: string,
  error: unknown,
  context?: Record<string, any>
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  const logEntry = {
    level: 'error',
    message,
    error: errorMessage,
    ...(stack && { stack }),
    ...(context && { context }),
    timestamp: new Date().toISOString(),
  };

  // Output as JSON for easy parsing and searching
  console.error(JSON.stringify(logEntry, null, 2));
}

export function logInfo(message: string, context?: Record<string, any>) {
  const logEntry = {
    level: 'info',
    message,
    ...(context && { context }),
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(logEntry, null, 2));
}
