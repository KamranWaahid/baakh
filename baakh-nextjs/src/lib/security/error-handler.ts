import { NextResponse } from 'next/server';
import { createSecurityAlert } from './alerts';
import { getClientIP } from './ip-whitelist';

export interface SecurityError extends Error {
  code?: string;
  statusCode?: number;
  isOperational?: boolean;
  context?: Record<string, any>;
}

export class AppError extends Error implements SecurityError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    context: Record<string, any> = {}
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error types
export class ValidationError extends AppError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 400, 'VALIDATION_ERROR', true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context: Record<string, any> = {}) {
    super(message, 401, 'AUTHENTICATION_ERROR', true, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context: Record<string, any> = {}) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context: Record<string, any> = {}) {
    super(message, 404, 'NOT_FOUND_ERROR', true, context);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 409, 'CONFLICT_ERROR', true, context);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context: Record<string, any> = {}) {
    super(message, 429, 'RATE_LIMIT_ERROR', true, context);
  }
}

export class SecurityError extends AppError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 403, 'SECURITY_ERROR', true, context);
  }
}

// Error response templates
const ERROR_RESPONSES = {
  VALIDATION_ERROR: {
    message: 'Invalid request data',
    code: 'VALIDATION_ERROR'
  },
  AUTHENTICATION_ERROR: {
    message: 'Authentication required',
    code: 'AUTHENTICATION_ERROR'
  },
  AUTHORIZATION_ERROR: {
    message: 'Insufficient permissions',
    code: 'AUTHORIZATION_ERROR'
  },
  NOT_FOUND_ERROR: {
    message: 'Resource not found',
    code: 'NOT_FOUND_ERROR'
  },
  CONFLICT_ERROR: {
    message: 'Resource conflict',
    code: 'CONFLICT_ERROR'
  },
  RATE_LIMIT_ERROR: {
    message: 'Too many requests',
    code: 'RATE_LIMIT_ERROR'
  },
  SECURITY_ERROR: {
    message: 'Security violation detected',
    code: 'SECURITY_ERROR'
  },
  INTERNAL_ERROR: {
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  }
};

/**
 * Create a safe error response without exposing sensitive information
 */
export function createErrorResponse(
  error: Error | SecurityError,
  request?: Request,
  includeDetails: boolean = false
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An error occurred';
  let details: any = {};

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
    details = error.context;
  } else if (error instanceof Error) {
    // Handle generic errors
    if (error.message.includes('validation')) {
      statusCode = 400;
      errorCode = 'VALIDATION_ERROR';
    } else if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      statusCode = 401;
      errorCode = 'AUTHENTICATION_ERROR';
    } else if (error.message.includes('forbidden') || error.message.includes('permission')) {
      statusCode = 403;
      errorCode = 'AUTHORIZATION_ERROR';
    } else if (error.message.includes('not found')) {
      statusCode = 404;
      errorCode = 'NOT_FOUND_ERROR';
    }
  }

  // Get safe error response
  const safeResponse = ERROR_RESPONSES[errorCode as keyof typeof ERROR_RESPONSES] || ERROR_RESPONSES.INTERNAL_ERROR;

  // Prepare response data
  const responseData: any = {
    success: false,
    error: safeResponse.code,
    message: safeResponse.message
  };

  // Add additional details based on environment and error type
  if (isDevelopment && includeDetails) {
    responseData.details = {
      originalMessage: error.message,
      stack: error.stack,
      context: sanitizeErrorContext(details)
    };
  } else if (isProduction && statusCode >= 500) {
    // In production, log detailed error but don't expose it
    console.error('Server Error:', {
      message: error.message,
      stack: error.stack,
      context: sanitizeErrorContext(details),
      timestamp: new Date().toISOString()
    });
    
    // In production, never expose internal error details
    if (statusCode >= 500) {
      responseData.message = 'An internal server error occurred';
      responseData.error = 'INTERNAL_ERROR';
    }
  }

  // Add retry information for rate limit errors
  if (errorCode === 'RATE_LIMIT_ERROR' && details.retryAfter) {
    responseData.retryAfter = details.retryAfter;
  }

  // Create response with appropriate headers
  const response = NextResponse.json(responseData, { status: statusCode });

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Add rate limit headers if applicable
  if (errorCode === 'RATE_LIMIT_ERROR') {
    if (details.retryAfter) {
      response.headers.set('Retry-After', details.retryAfter.toString());
    }
    if (details.remaining !== undefined) {
      response.headers.set('X-RateLimit-Remaining', details.remaining.toString());
    }
    if (details.resetTime) {
      response.headers.set('X-RateLimit-Reset', details.resetTime.toString());
    }
  }

  return response;
}

/**
 * Handle async errors in API routes
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);
      
      // Log security-related errors
      if (error instanceof SecurityError || 
          (error instanceof Error && error.message.includes('security'))) {
        const request = args[0] as Request;
        const clientIP = getClientIP(request);
        
        await createSecurityAlert(
          'api_error',
          'medium',
          'API Security Error',
          error.message,
          {
            error: error.message,
            stack: error.stack,
            context: error instanceof AppError ? error.context : {}
          },
          clientIP
        );
      }

      return createErrorResponse(error as Error, args[0] as Request);
    }
  };
}

/**
 * Validate and sanitize error context
 */
export function sanitizeErrorContext(context: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string') {
      // Remove sensitive information
      if (key.toLowerCase().includes('password') || 
          key.toLowerCase().includes('secret') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('key')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeErrorContext(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Create a standardized error logger
 */
export function logError(
  error: Error | SecurityError,
  context: Record<string, any> = {},
  level: 'low' | 'medium' | 'high' = 'medium'
): void {
  const sanitizedContext = sanitizeErrorContext(context);
  
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context: sanitizedContext
  };

  // Log based on level
  switch (level) {
    case 'high':
      console.error('HIGH PRIORITY ERROR:', logData);
      break;
    case 'medium':
      console.warn('MEDIUM PRIORITY ERROR:', logData);
      break;
    case 'low':
      console.log('LOW PRIORITY ERROR:', logData);
      break;
  }
}

/**
 * Global error handler for unhandled promise rejections
 */
export function setupGlobalErrorHandling(): void {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    // Log as security alert if it might be security-related
    if (reason instanceof Error && 
        (reason.message.includes('security') || reason.message.includes('auth'))) {
      createSecurityAlert(
        'unhandled_rejection',
        'high',
        'Unhandled Promise Rejection',
        reason.message,
        { reason: reason.toString(), stack: reason.stack }
      );
    }
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    
    // Log as security alert
    createSecurityAlert(
      'uncaught_exception',
      'high',
      'Uncaught Exception',
      error.message,
      { stack: error.stack }
    );
    
    // Exit process in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
}
