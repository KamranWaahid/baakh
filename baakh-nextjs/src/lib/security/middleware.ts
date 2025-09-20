import { NextRequest, NextResponse } from 'next/server';
import { verifySignedCSRFToken } from './csrf';
import { sanitizeHTML } from './html-sanitizer';
import { withIPWhitelist } from './ip-middleware';
import { detectThreats, detectSuspiciousAPIUsage } from './threat-detection';
import { createSecurityAlert } from './alerts';
import { getClientIP } from './ip-whitelist';
import { apiRateLimiter, authRateLimiter, adminRateLimiter } from './redis-rate-limiter';

/**
 * CSRF Protection Middleware
 */
export function withCSRFProtection(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
      return handler(req);
    }

    // Get CSRF token from headers
    const csrfToken = req.headers.get('X-CSRF-Token');
    
    if (!csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      );
    }

    // Verify CSRF token
    const verifiedToken = verifySignedCSRFToken(csrfToken);
    if (!verifiedToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Continue with the original handler
    return handler(req);
  };
}

/**
 * Rate Limiting Middleware with Redis support
 */
export function withRateLimit(
  limiter: 'api' | 'auth' | 'admin' = 'api'
) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest): Promise<NextResponse> => {
      const clientIP = getClientIP(req);
      const identifier = `${clientIP}:${req.url}`;
      
      // Select appropriate rate limiter
      const rateLimiter = limiter === 'auth' ? authRateLimiter 
        : limiter === 'admin' ? adminRateLimiter 
        : apiRateLimiter;

      try {
        const result = await rateLimiter.checkLimit(identifier);
        
        if (!result.allowed) {
          // Log rate limit violation
          await createSecurityAlert(
            'rate_limit_exceeded',
            'medium',
            'Rate Limit Exceeded',
            `Rate limit exceeded for ${clientIP}`,
            {
              ip: clientIP,
              endpoint: req.url,
              method: req.method,
              totalHits: result.totalHits,
              resetTime: result.resetTime
            },
            clientIP
          );

          return NextResponse.json(
            { 
              error: 'Rate limit exceeded',
              retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
            },
            { 
              status: 429,
              headers: {
                'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': result.resetTime.toString()
              }
            }
          );
        }

        // Add rate limit headers to successful responses
        const response = await handler(req);
        
        response.headers.set('X-RateLimit-Limit', '100');
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
        
        return response;

      } catch (error) {
        console.error('Rate limiting error:', error);
        // Continue with request if rate limiting fails
        return handler(req);
      }
    };
  };
}

/**
 * Input Sanitization Middleware
 */
export function withInputSanitization(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Sanitize URL parameters
    const url = new URL(req.url);
    const sanitizedParams = new URLSearchParams();
    
    for (const [key, value] of url.searchParams.entries()) {
      sanitizedParams.set(key, sanitizeHTML(value, true)); // true = server-side
    }
    
    // Create new URL with sanitized parameters
    const sanitizedUrl = new URL(url.pathname + '?' + sanitizedParams.toString(), url.origin);
    
    // Create new request with sanitized URL
    const sanitizedReq = new Request(sanitizedUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body
    });

    return handler(sanitizedReq);
  };
}

/**
 * Security Headers Middleware
 */
export function withSecurityHeaders(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);
    
    return response;
  };
}

/**
 * Advanced Security Middleware with Threat Detection
 */
export function withAdvancedSecurity(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withIPWhitelist(async (req: NextRequest): Promise<NextResponse> => {
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('User-Agent') || 'unknown';
    const userId = req.headers.get('x-user-id') || undefined;
    
    try {
      // Threat detection
      await detectThreats('api_access', clientIP, userId, {
        endpoint: req.url,
        method: req.method,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      });
      
      // Detect suspicious API usage
      if (userId) {
        await detectSuspiciousAPIUsage(clientIP, userId, req.url, req.method);
      }
      
      // Proceed to the original handler
      const response = await handler(req);
      
      // Log successful API access
      await createSecurityAlert(
        'api_access',
        'low',
        'API Access',
        'Successful API access',
        { 
          endpoint: req.url, 
          method: req.method,
          status_code: response.status 
        },
        clientIP,
        userId
      );
      
      return response;
      
    } catch (error) {
      console.error('Advanced security middleware error:', error);
      
      // Log security error
      await createSecurityAlert(
        'system_anomaly',
        'high',
        'Security Middleware Error',
        'Error in security middleware',
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: req.url,
          method: req.method
        },
        clientIP,
        userId
      );
      
      return NextResponse.json(
        { error: 'Security check failed' },
        { status: 500 }
      );
    }
  });
}

/**
 * Combined Security Middleware
 */
export function withSecurity(
  rateLimiter: 'api' | 'auth' | 'admin' = 'api'
) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return withSecurityHeaders(
      withInputSanitization(
        withRateLimit(rateLimiter)(
          withCSRFProtection(handler)
        )
      )
    );
  };
}
