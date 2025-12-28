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
  // Auth error codes
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
  AUTH_EMAIL_IN_USE: "AUTH_EMAIL_IN_USE",
  AUTH_WEAK_PASSWORD: "AUTH_WEAK_PASSWORD",
  AUTH_INVALID_EMAIL: "AUTH_INVALID_EMAIL",
  AUTH_SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
  AUTH_NETWORK_ERROR: "AUTH_NETWORK_ERROR",
  AUTH_RATE_LIMITED: "AUTH_RATE_LIMITED",
  AUTH_UNKNOWN_ERROR: "AUTH_UNKNOWN_ERROR",
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

/**
 * Map of Supabase auth error codes to user-friendly messages
 */
const authErrorMessages: Record<string, string> = {
  // Sign in errors
  "Invalid login credentials": "Incorrect email or password. Please try again.",
  "Email not confirmed": "Please verify your email address before signing in.",
  "User not found": "No account found with this email address.",
  
  // Sign up errors
  "User already registered": "An account with this email already exists.",
  "Password should be at least 6 characters": "Password must be at least 6 characters long.",
  "Signup requires a valid password": "Please enter a valid password.",
  
  // Password reset errors
  "Email rate limit exceeded": "Too many requests. Please wait a moment and try again.",
  "For security purposes, you can only request this once every 60 seconds": 
    "Please wait 60 seconds before requesting another password reset.",
  
  // Session errors
  "Invalid Refresh Token": "Your session has expired. Please sign in again.",
  "Refresh Token Not Found": "Your session has expired. Please sign in again.",
  "Session not found": "Your session has expired. Please sign in again.",
  
  // Network errors
  "Failed to fetch": "Network error. Please check your internet connection.",
  "NetworkError when attempting to fetch resource": "Network error. Please check your internet connection.",
};

/**
 * Get user-friendly message for auth errors
 * @param error - Error from Supabase auth
 * @returns User-friendly error message
 */
export const getAuthErrorMessage = (error: unknown): string => {
  if (!error) {
    return "An unexpected error occurred";
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for known error messages
  for (const [key, friendlyMessage] of Object.entries(authErrorMessages)) {
    if (errorMessage.includes(key)) {
      return friendlyMessage;
    }
  }

  // Log unknown auth errors for debugging
  if (import.meta.env.DEV) {
    console.warn("Unknown auth error:", errorMessage);
  }

  // Return a generic message for unknown errors
  return "An error occurred during authentication. Please try again.";
};

/**
 * Check if an error is an auth-related error
 * @param error - Error to check
 * @returns True if the error is auth-related
 */
export const isAuthError = (error: unknown): boolean => {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  const authKeywords = [
    "auth",
    "login",
    "credential",
    "password",
    "email",
    "session",
    "token",
    "signup",
    "sign",
  ];
  
  return authKeywords.some((keyword) =>
    errorMessage.toLowerCase().includes(keyword)
  );
};

/**
 * Check if error indicates session has expired
 * @param error - Error to check
 * @returns True if session has expired
 */
export const isSessionExpiredError = (error: unknown): boolean => {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return (
    errorMessage.includes("Refresh Token") ||
    errorMessage.includes("Session not found") ||
    errorMessage.includes("session has expired")
  );
};
