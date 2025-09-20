import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

/**
 * Get or generate a nonce for the current request
 * This should be called in middleware or API routes
 */
export function getNonce(): string {
  // In a real implementation, this would be stored per request
  // For now, we'll generate a new one each time
  return generateNonce();
}

/**
 * Create CSP header with nonce
 */
export function createCSPHeader(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'strict-dynamic' 'nonce-${nonce}'`,
    `style-src 'self' 'strict-dynamic' 'nonce-${nonce}'`,
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://uhbqcaxwfossrjwusclc.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "upgrade-insecure-requests"
  ].join('; ');
}
