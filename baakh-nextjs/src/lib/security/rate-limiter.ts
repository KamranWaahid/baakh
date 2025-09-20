import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, RateLimitError } from './error-handler';

interface RateLimitConfig {
  requests: number;
  window: string; // e.g., '15m', '1h', '1d'
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Parse window string to milliseconds
function parseWindow(window: string): number {
  const units: { [key: string]: number } = {
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  };
  
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid window format: ${window}`);
  }
  
  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

// Default key generator (uses IP address)
function defaultKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
            request.headers.get('x-real-ip') || 
            'unknown';
  return ip;
}

// Clean up expired entries
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Rate limiting middleware
export function withRateLimit<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return withErrorHandling(async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance
      cleanupExpiredEntries();
    }
    
    const keyGenerator = config.keyGenerator || defaultKeyGenerator;
    const key = keyGenerator(request);
    const windowMs = parseWindow(config.window);
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    // Check if limit exceeded
    if (entry.count >= config.requests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      throw new RateLimitError('Rate limit exceeded', {
        retryAfter,
        limit: config.requests,
        remaining: 0,
        resetTime: entry.resetTime
      });
    }
    
    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);
    
    // Call the original handler
    const response = await handler(...args);
    
    // Add rate limit headers
    const remaining = Math.max(0, config.requests - entry.count);
    const resetTime = entry.resetTime;
    
    response.headers.set('X-RateLimit-Limit', config.requests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
    
    return response;
  });
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Strict rate limiting for auth endpoints
  auth: {
    requests: 5,
    window: '15m',
    keyGenerator: (request: NextRequest) => {
      const ip = defaultKeyGenerator(request);
      const userAgent = request.headers.get('user-agent') || '';
      return `${ip}:${userAgent}`;
    }
  },
  
  // Moderate rate limiting for API endpoints
  api: {
    requests: 100,
    window: '15m'
  },
  
  // Lenient rate limiting for public endpoints
  public: {
    requests: 200,
    window: '15m'
  },
  
  // Very strict rate limiting for admin endpoints
  admin: {
    requests: 50,
    window: '15m'
  },
  
  // Rate limiting for search endpoints
  search: {
    requests: 30,
    window: '1m'
  }
};

// Helper functions for common rate limiting scenarios
export const withAuthRateLimit = <T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) => withRateLimit(handler, rateLimitConfigs.auth);

export const withApiRateLimit = <T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) => withRateLimit(handler, rateLimitConfigs.api);

export const withPublicRateLimit = <T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) => withRateLimit(handler, rateLimitConfigs.public);

export const withAdminRateLimit = <T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) => withRateLimit(handler, rateLimitConfigs.admin);

export const withSearchRateLimit = <T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) => withRateLimit(handler, rateLimitConfigs.search);
