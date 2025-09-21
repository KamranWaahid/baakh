import { randomBytes, createHmac } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET;

if (!CSRF_SECRET) {
  throw new Error('CSRF_SECRET environment variable is required for security. Please set it in your .env.local file.');
}
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

export interface CSRFToken {
  token: string;
  expires: number;
}

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): CSRFToken {
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const expires = Date.now() + CSRF_TOKEN_EXPIRY;
  
  return {
    token,
    expires
  };
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(token: string, storedToken: string, storedExpires: number): boolean {
  // Check if token has expired
  if (Date.now() > storedExpires) {
    return false;
  }
  
  // Check if tokens match
  return token === storedToken;
}

/**
 * Create a signed CSRF token for additional security
 */
export function createSignedCSRFToken(token: string): string {
  const hmac = createHmac('sha256', CSRF_SECRET!);
  hmac.update(token);
  const signature = hmac.digest('hex');
  return `${token}.${signature}`;
}

/**
 * Verify a signed CSRF token
 */
export function verifySignedCSRFToken(signedToken: string): string | null {
  const parts = signedToken.split('.');
  if (parts.length !== 2) {
    return null;
  }
  
  const [token, signature] = parts;
  
  // Verify signature
  const hmac = createHmac('sha256', CSRF_SECRET!);
  hmac.update(token);
  const expectedSignature = hmac.digest('hex');
  
  if (signature !== expectedSignature) {
    return null;
  }
  
  return token;
}

/**
 * Sanitize input to prevent XSS
 * @deprecated Use sanitizeHTML from html-sanitizer.ts instead
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/['"]/g, '') // Remove quotes
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate slug format (alphanumeric, hyphens, underscores only)
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-_]+$/;
  return slugRegex.test(slug);
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, (s) => map[s]);
}
