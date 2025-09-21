import { z } from 'zod';
import { sanitizeHTML } from './html-sanitizer';

// Common validation schemas
export const commonSchemas = {
  // Basic string validation
  nonEmptyString: z.string().min(1).max(1000),
  
  // Email validation
  email: z.string().email().max(255),
  
  // Username validation
  username: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  // Password validation
  password: z.string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/, 
          'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  // Slug validation
  slug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  
  // ID validation (UUID or integer)
  id: z.union([
    z.string().uuid(),
    z.string().regex(/^\d+$/).transform(Number)
  ]),
  
  // URL validation
  url: z.string().url().max(2048),
  
  // HTML content validation
  htmlContent: z.string().max(10000).transform((val) => sanitizeHTML(val, true)),
  
  // JSON validation
  json: z.string().transform((val) => {
    try {
      return JSON.parse(val);
    } catch {
      throw new Error('Invalid JSON format');
    }
  }),
  
  // Pagination validation
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
    offset: z.number().int().min(0).optional()
  }),
  
  // Search query validation
  searchQuery: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u067E\u0686\u0698\u06A9\u06AF\u06BE\u06C1\u06D2]+$/, 
          'Search query contains invalid characters'),
  
  // Language validation
  language: z.enum(['en', 'sd']).default('en'),
  
  // Status validation
  status: z.enum(['active', 'inactive', 'pending', 'published', 'draft']).optional(),
  
  // Date validation
  date: z.string().datetime().optional(),
  
  // File validation
  file: z.object({
    name: z.string().min(1).max(255),
    size: z.number().int().min(1).max(10 * 1024 * 1024), // 10MB max
    type: z.string().regex(/^[a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+$/, 'Invalid file type'),
    content: z.string().optional()
  })
};

// API-specific validation schemas
export const apiSchemas = {
  // Auth schemas
  login: z.object({
    username: commonSchemas.username,
    password: z.string().min(1).max(128)
  }),
  
  signup: z.object({
    username: commonSchemas.username,
    password: commonSchemas.password,
    profile: z.object({
      email: commonSchemas.email,
      name: commonSchemas.nonEmptyString.max(100)
    }),
    encryptedData: z.object({
      passwordSalt: z.string(),
      passwordVerifier: z.string(),
      passwordVerifierNonce: z.string(),
      profileCipher: z.string(),
      profileNonce: z.string(),
      profileAad: z.string(),
      masterKeyCipher: z.string(),
      masterKeyNonce: z.string(),
      kdfParams: z.record(z.string(), z.any())
    })
  }),
  
  // Poetry schemas
  poetry: z.object({
    title: commonSchemas.nonEmptyString.max(200),
    content: commonSchemas.htmlContent,
    poet_id: commonSchemas.id,
    category_id: commonSchemas.id.optional(),
    lang: commonSchemas.language,
    visibility: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    tags: z.array(z.string().max(50)).max(10).optional(),
    metadata: z.record(z.string(), z.any()).optional()
  }),
  
  // Poet schemas
  poet: z.object({
    sindhi_name: commonSchemas.nonEmptyString.max(100),
    english_name: commonSchemas.nonEmptyString.max(100),
    poet_slug: commonSchemas.slug,
    birth_date: z.string().optional(),
    death_date: z.string().optional(),
    birth_place: z.string().max(100).optional(),
    death_place: z.string().max(100).optional(),
    description: commonSchemas.htmlContent.optional(),
    file_url: commonSchemas.url.optional(),
    is_featured: z.boolean().default(false),
    metadata: z.record(z.string(), z.any()).optional()
  }),
  
  // Search schemas
  search: z.object({
    q: commonSchemas.searchQuery,
    lang: commonSchemas.language,
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(50).default(10),
    filters: z.record(z.string(), z.any()).optional()
  }),
  
  // Report schemas
  report: z.object({
    reason: z.enum([
      'contentError', 'offensive', 'copyright', 'spam', 
      'misinformation', 'lowQuality', 'wrongPoet', 
      'triggering', 'wrongCategory', 'duplicate', 'other'
    ]),
    description: z.string().max(1000).optional(),
    target_type: z.enum(['poem', 'poet', 'couplet']),
    target_id: commonSchemas.id,
    reporter_email: commonSchemas.email.optional()
  }),
  
  // Admin schemas
  adminUpdate: z.object({
    status: commonSchemas.status,
    admin_notes: z.string().max(1000).optional(),
    metadata: z.record(z.string(), z.any()).optional()
  })
};

// Validation helper functions
export function validateInput<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: any) => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      throw new Error(`Validation error: ${errorMessages}`);
    }
    throw error;
  }
}

export function validateApiInput<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return validateInput(data, schema);
  } catch (error) {
    console.error('API input validation failed:', error);
    throw new Error('Invalid input data');
  }
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return sanitizeHTML(input, true).trim();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  return sanitized;
}

// SQL injection prevention
export function sanitizeSQLInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove SQL injection patterns
  return input
    .replace(/['"`;\\]/g, '') // Remove quotes and semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, '') // Remove SQL keywords
    .trim();
}

// XSS prevention
export function sanitizeXSS(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
}

// File upload validation
export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
  content?: string;
}): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain'
  ];
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.txt'];
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  
  // Check file size
  if (file.size > maxSize) {
    return false;
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return false;
  }
  
  // Check for malicious content in file name
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return false;
  }
  
  return true;
}
