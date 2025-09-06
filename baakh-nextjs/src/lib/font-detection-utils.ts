/**
 * Font Detection Utilities
 * Prevents Sindhi fonts from being applied to numbers, characters, and mixed content
 */

/**
 * Regular expressions for detecting different content types
 */
export const CONTENT_PATTERNS = {
  // Numbers (including decimals, fractions, percentages, etc.)
  numbers: /[\d.,%+\-()]/g,
  
  // Pure numbers (only digits, dots, commas, etc.)
  pureNumbers: /^[\d.,%+\-()\s]+$/,
  
  // English characters and common symbols
  englishChars: /[a-zA-Z0-9.,;:!?@#$%^&*()_+\-=\[\]{}|\\:";'<>?/~`]/g,
  
  // Mixed content (contains both Sindhi and non-Sindhi)
  mixedContent: /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF].*[a-zA-Z0-9]|[a-zA-Z0-9].*[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
  
  // Sindhi/Arabic characters
  sindhiChars: /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
  
  // Punctuation and symbols that should use Inter
  punctuation: /[.,;:!?@#$%^&*()_+\-=\[\]{}|\\:";'<>?/~`]/g
};

/**
 * Checks if text contains only numbers and characters that should use Inter font
 * @param text - The text to check
 * @returns boolean indicating if text should use Inter font
 */
export const shouldUseInterFont = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;
  
  // Check if text is pure numbers
  if (CONTENT_PATTERNS.pureNumbers.test(text.trim())) {
    return true;
  }
  
  // Check if text contains only English characters and punctuation
  const hasSindhiChars = CONTENT_PATTERNS.sindhiChars.test(text);
  const hasEnglishChars = CONTENT_PATTERNS.englishChars.test(text);
  
  // If it has English characters but no Sindhi characters, use Inter
  if (hasEnglishChars && !hasSindhiChars) {
    return true;
  }
  
  return false;
};

/**
 * Checks if text contains only Sindhi characters
 * @param text - The text to check
 * @returns boolean indicating if text should use Sindhi font
 */
export const shouldUseSindhiFont = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;
  
  const hasSindhiChars = CONTENT_PATTERNS.sindhiChars.test(text);
  const hasEnglishChars = CONTENT_PATTERNS.englishChars.test(text);
  
  // Use Sindhi font only if it has Sindhi characters and no English characters
  return hasSindhiChars && !hasEnglishChars;
};

/**
 * Processes mixed content and returns appropriate font classes for each part
 * @param text - The text to process
 * @returns Array of text parts with appropriate font classes
 */
export const processMixedContent = (text: string): Array<{
  text: string;
  className: string;
  isNumber: boolean;
  isSindhi: boolean;
  isEnglish: boolean;
}> => {
  if (!text || typeof text !== 'string') {
    return [{ text: '', className: 'font-inter', isNumber: false, isSindhi: false, isEnglish: false }];
  }

  const parts: Array<{
    text: string;
    className: string;
    isNumber: boolean;
    isSindhi: boolean;
    isEnglish: boolean;
  }> = [];

  // Split text by spaces and process each part
  const textParts = text.split(/(\s+)/);
  
  for (const part of textParts) {
    if (!part) continue;
    
    // Handle whitespace
    if (/^\s+$/.test(part)) {
      parts.push({
        text: part,
        className: '',
        isNumber: false,
        isSindhi: false,
        isEnglish: false
      });
      continue;
    }
    
    // Determine font class based on content
    if (shouldUseInterFont(part)) {
      parts.push({
        text: part,
        className: 'font-inter',
        isNumber: CONTENT_PATTERNS.pureNumbers.test(part.trim()),
        isSindhi: false,
        isEnglish: true
      });
    } else if (shouldUseSindhiFont(part)) {
      parts.push({
        text: part,
        className: 'font-sindhi',
        isNumber: false,
        isSindhi: true,
        isEnglish: false
      });
    } else {
      // Mixed content - use Inter as default
      parts.push({
        text: part,
        className: 'font-inter',
        isNumber: false,
        isSindhi: false,
        isEnglish: true
      });
    }
  }
  
  return parts;
};

/**
 * Gets the appropriate font class for text based on content analysis
 * @param text - The text to analyze
 * @param defaultClass - Default class to use if text is empty
 * @returns Font class string
 */
export const getSmartFontClass = (text: string, defaultClass: string = 'font-inter'): string => {
  if (!text || typeof text !== 'string') return defaultClass;
  
  if (shouldUseInterFont(text)) {
    return 'font-inter';
  }
  
  if (shouldUseSindhiFont(text)) {
    return 'font-sindhi';
  }
  
  // Default to Inter for mixed content or unknown content
  return 'font-inter';
};

/**
 * React component props for smart font handling
 */
export interface SmartFontProps {
  text?: string | null;
  children?: React.ReactNode;
  className?: string;
  defaultFont?: 'sindhi' | 'inter';
}

/**
 * Hook for smart font detection
 */
export const useSmartFont = () => {
  return {
    shouldUseInterFont,
    shouldUseSindhiFont,
    processMixedContent,
    getSmartFontClass,
    CONTENT_PATTERNS
  };
};
