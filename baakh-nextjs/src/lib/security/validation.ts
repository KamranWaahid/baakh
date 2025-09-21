import { z } from 'zod';
import { sanitizeHTML } from './html-sanitizer';

// Common validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim();

export const slugSchema = z.string()
  .min(1, 'Slug is required')
  .max(100, 'Slug too long')
  .regex(/^[a-z0-9-_]+$/, 'Slug can only contain lowercase letters, numbers, hyphens, and underscores')
  .trim();

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(200, 'Name too long')
  .regex(/^[a-zA-Z\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/, 'Name contains invalid characters')
  .trim();

export const textSchema = z.string()
  .min(1, 'Text is required')
  .max(5000, 'Text too long')
  .trim();

export const urlSchema = z.string()
  .url('Invalid URL format')
  .max(500, 'URL too long')
  .optional()
  .or(z.literal(''));

export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .optional()
  .or(z.literal(''));

// Poet validation schema
export const poetCreateSchema = z.object({
  poet_slug: slugSchema,
  sindhi_name: nameSchema,
  english_name: nameSchema,
  sindhi_laqab: z.string().max(100, 'Laqab too long').trim().optional().or(z.literal('')),
  english_laqab: z.string().max(100, 'Laqab too long').trim().optional().or(z.literal('')),
  sindhi_takhalus: z.string().max(100, 'Takhalus too long').trim().optional().or(z.literal('')),
  english_takhalus: z.string().max(100, 'Takhalus too long').trim().optional().or(z.literal('')),
  sindhi_tagline: z.string().max(200, 'Tagline too long').trim().optional().or(z.literal('')),
  english_tagline: z.string().max(200, 'Tagline too long').trim().optional().or(z.literal('')),
  sindhi_details: z.string().max(5000, 'Details too long').trim().optional().or(z.literal('')),
  english_details: z.string().max(5000, 'Details too long').trim().optional().or(z.literal('')),
  birth_date: dateSchema,
  death_date: dateSchema,
  birth_place: z.string().max(200, 'Birth place too long').trim().optional().or(z.literal('')),
  death_place: z.string().max(200, 'Death place too long').trim().optional().or(z.literal('')),
  tags: z.array(z.string().max(50, 'Tag too long')).optional().default([]),
  file_url: urlSchema,
  is_featured: z.boolean().optional().default(false),
  is_hidden: z.boolean().optional().default(false)
});

// Poetry validation schema
export const poetryCreateSchema = z.object({
  poetry_slug: slugSchema,
  lang: z.enum(['sd', 'en'], { message: 'Language is required' }),
  visibility: z.boolean().optional().default(true),
  is_featured: z.boolean().optional().default(false),
  category_id: z.string().uuid('Invalid category ID').optional(),
  poetry_tags: z.string().max(500, 'Tags too long').trim().optional().or(z.literal('')),
  // Add other poetry fields as needed
});

// Couplet validation schema
export const coupletCreateSchema = z.object({
  poetry_id: z.number().int().min(0, 'Invalid poetry ID'),
  poet_id: z.number().int().min(1, 'Poet ID is required'),
  couplet_slug: slugSchema,
  couplet_text: textSchema,
  couplet_tags: z.string().max(500, 'Tags too long').trim().optional().or(z.literal('')),
  lang: z.enum(['sd', 'en'], { message: 'Language is required' })
});

// Tag validation schema
export const tagCreateSchema = z.object({
  slug: slugSchema,
  label: z.string().min(1, 'Label is required').max(100, 'Label too long').trim(),
  tag_type: z.string().min(1, 'Tag type is required').max(50, 'Tag type too long').trim(),
  // Translation fields
  english_title: z.string().min(1, 'English title is required').max(200, 'Title too long').trim(),
  sindhi_title: z.string().min(1, 'Sindhi title is required').max(200, 'Title too long').trim(),
  english_details: z.string().max(1000, 'Details too long').trim().optional().or(z.literal('')),
  sindhi_details: z.string().max(1000, 'Details too long').trim().optional().or(z.literal(''))
});

// Search validation schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Query too long').trim(),
  page: z.number().int().min(1, 'Page must be at least 1').optional().default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit too high').optional().default(10),
  sortBy: z.string().max(50, 'Sort field too long').optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Sanitize input data
export function sanitizeInput<T>(data: T, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.issues.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Validate and sanitize API input
export function validateApiInput<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Input validation failed: ${errorMessage}`);
    }
    throw new Error('Invalid input data');
  }
}

// Sanitize HTML content using DOMPurify
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  try {
    return sanitizeHTML(html, false); // false = client-side
  } catch (error) {
    console.error('HTML sanitization error:', error);
    // Fallback to basic sanitization
    return html
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .trim();
  }
}

// Validate file upload
export function validateFileUpload(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
} = {}): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  return { valid: true };
}
