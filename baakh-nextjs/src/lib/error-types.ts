// Custom error types for better error handling

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export class NetworkError extends Error {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export class ValidationError extends Error {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

export class AuthenticationError extends Error {
  public readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
  }
}

export class AuthorizationError extends Error {
  public readonly requiredPermission?: string;

  constructor(message: string, requiredPermission?: string) {
    super(message);
    this.name = 'AuthorizationError';
    this.requiredPermission = requiredPermission;
  }
}

export class TimeoutError extends Error {
  public readonly timeout: number;

  constructor(message: string, timeout: number) {
    super(message);
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}

// Type guard functions
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

// Helper function to safely extract error information
export function getErrorInfo(error: unknown): {
  message: string;
  name: string;
  status?: number;
  code?: string;
  field?: string;
  timeout?: number;
} {
  if (error instanceof Error) {
    if (isApiError(error)) {
      return {
        message: error.message,
        name: error.name,
        status: error.status,
        code: error.code,
      };
    }
    
    if (isValidationError(error)) {
      return {
        message: error.message,
        name: error.name,
        field: error.field,
      };
    }
    
    if (isTimeoutError(error)) {
      return {
        message: error.message,
        name: error.name,
        timeout: error.timeout,
      };
    }
    
    return {
      message: error.message,
      name: error.name,
    };
  }
  
  return {
    message: String(error),
    name: 'UnknownError',
  };
}
