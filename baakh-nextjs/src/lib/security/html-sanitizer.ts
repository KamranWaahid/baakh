import DOMPurify from 'dompurify';

// Server-side DOMPurify configuration
const serverConfig = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  SANITIZE_DOM: true,
  FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'meta', 'iframe'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
  ADD_ATTR: [],
  ADD_TAGS: [],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SANITIZE_NAMED_PROPS: true,
  WHOLE_DOCUMENT: false,
  RETURN_TRUSTED_TYPE: false,
  CUSTOM_ELEMENT_HANDLING: {
    tagNameCheck: null,
    attributeNameCheck: null,
    allowCustomizedBuiltInElements: false,
  },
};

// Client-side DOMPurify configuration
const clientConfig = {
  ...serverConfig,
  // Additional client-side specific configs can be added here
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @param isServer - Whether this is running on the server
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string, isServer: boolean = false): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    const config = isServer ? serverConfig : clientConfig;
    
    // For server-side, we need to create a JSDOM environment
    if (isServer) {
      // In server environment, we'll use a more restrictive approach
      return sanitizeHTMLServer(html);
    }
    
    // For client-side, use DOMPurify directly
    return DOMPurify.sanitize(html, config);
  } catch (error) {
    console.error('HTML sanitization error:', error);
    // Return empty string on error to prevent XSS
    return '';
  }
}

/**
 * Server-side HTML sanitization using regex patterns
 * This is a fallback when DOMPurify is not available on server
 */
function sanitizeHTMLServer(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '') // Remove link tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*>/gi, '') // Remove meta tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/<[^>]*>/g, (match) => {
      // Remove any remaining potentially dangerous tags
      const tagName = match.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/)?.[1]?.toLowerCase();
      const dangerousTags = ['script', 'object', 'embed', 'link', 'style', 'meta', 'iframe', 'form', 'input', 'button'];
      
      if (tagName && dangerousTags.includes(tagName)) {
        return '';
      }
      
      return match;
    })
    .trim();
}

/**
 * Sanitize JSON data for use in dangerouslySetInnerHTML
 * @param data - The data to sanitize
 * @returns Sanitized data safe for JSON.stringify
 */
export function sanitizeJSONData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeHTML(data, true);
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeJSONData(item));
  }

  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeJSONData(value);
    }
    return sanitized;
  }

  return data;
}

/**
 * Validate and sanitize structured data for JSON-LD
 * @param structuredData - The structured data object
 * @returns Sanitized structured data
 */
export function sanitizeStructuredData(structuredData: any): any {
  try {
    // Deep clone the data
    const cloned = JSON.parse(JSON.stringify(structuredData));
    
    // Sanitize the cloned data
    const sanitized = sanitizeJSONData(cloned);
    
    // Validate that the result is still valid JSON
    JSON.stringify(sanitized);
    
    return sanitized;
  } catch (error) {
    console.error('Structured data sanitization error:', error);
    // Return a safe default structure
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Baakh Poetry Archive',
      description: 'A comprehensive archive of Sindhi poetry'
    };
  }
}
