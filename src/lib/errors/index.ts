/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error logging
 * In production, this should integrate with a service like Sentry or Firebase Crashlytics
 */
export function logError(error: unknown, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with error tracking service (Sentry, Firebase Crashlytics, etc.)
    // Sentry.captureException(error, { extra: context });
    console.error('[Production Error]:', error, 'Context:', context);
  } else {
    console.error('[Dev Error]:', error, 'Context:', context);
  }
}

/**
 * Predefined error types for common scenarios
 */
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TEMPLATE_CREATE_FAILED: 'TEMPLATE_CREATE_FAILED',
  TEMPLATE_UPDATE_FAILED: 'TEMPLATE_UPDATE_FAILED',
  TEMPLATE_DELETE_FAILED: 'TEMPLATE_DELETE_FAILED',
  TEMPLATE_FETCH_FAILED: 'TEMPLATE_FETCH_FAILED',
  FIREBASE_ERROR: 'FIREBASE_ERROR',
} as const;
