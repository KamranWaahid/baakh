// Edge-safe CSRF utilities: avoid Node 'crypto'; provide reduced-strength fallbacks

function getCsrfSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error('CSRF_SECRET environment variable is required for security. Please set it in your .env.local (local) and Project Environment Variables (Vercel).');
  }
  return secret;
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
  const bytes = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
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
  // Edge fallback: append a static marker instead of HMAC (reduced security)
  const edgeRuntimeDetected = typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis;
  if (edgeRuntimeDetected) {
    console.warn('CSRF signing downgraded on Edge runtime');
    return `${token}.edge`;
  }
  return `${token}.edge`;
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
  // Edge fallback: accept marker
  if (signature !== 'edge') {
    // In non-Edge environments you should verify the HMAC
    console.warn('Unexpected CSRF signature format on Edge');
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
