/**
 * Error handling utilities
 * Centralized error handling and logging functions
 */

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error codes for different error types
 */
export const ErrorCodes = {
  AUDIO_INIT_FAILED: "AUDIO_INIT_FAILED",
  MODEL_LOAD_FAILED: "MODEL_LOAD_FAILED",
  ANIMATION_LOAD_FAILED: "ANIMATION_LOAD_FAILED",
  MORPH_TARGET_NOT_FOUND: "MORPH_TARGET_NOT_FOUND",
  CAMERA_INIT_FAILED: "CAMERA_INIT_FAILED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

/**
 * Log error with context
 * @param error - Error object or message
 * @param context - Additional context information
 */
export const logError = (
  error: unknown,
  context?: Record<string, unknown>
): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error("Error:", errorMessage, {
    context,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Handle error gracefully with user-friendly message
 * @param error - Error object or message
 * @param fallbackMessage - Fallback message to show to user
 * @returns User-friendly error message
 */
export const handleError = (
  error: unknown,
  fallbackMessage = "An error occurred"
): string => {
  logError(error);

  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // In production, return generic message; in development, return actual error
    if (import.meta.env.DEV) {
      return error.message;
    }
  }

  return fallbackMessage;
};

/**
 * Create an error with code and context
 * @param message - Error message
 * @param code - Error code
 * @param context - Additional context
 * @returns AppError instance
 */
export const createError = (
  message: string,
  code?: keyof typeof ErrorCodes,
  context?: Record<string, unknown>
): AppError => {
  return new AppError(message, code ? ErrorCodes[code] : undefined, context);
};

/**
 * Safe async function wrapper
 * Catches errors and logs them
 * @param fn - Async function to wrap
 * @param errorMessage - Error message to use if function fails
 * @returns Result of the function or null if error occurred
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  errorMessage = "Operation failed"
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    logError(error, { errorMessage });
    return null;
  }
};
