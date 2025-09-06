/**
 * Sindhi Font Utilities
 * Provides functions to handle Sindhi fonts with proper number formatting
 */

/**
 * Checks if text contains Sindhi/Arabic characters
 * @param text - The text to check
 * @returns boolean indicating if text contains Sindhi/Arabic characters
 */
export const containsSindhiText = (text?: string | null): boolean => {
  if (!text) return false;
  return /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
};

/**
 * Applies Sindhi font class only to text that contains Sindhi/Arabic characters
 * Numbers and English text will not be affected
 * @param text - The text to check
 * @param baseClass - Base CSS class to apply
 * @returns CSS class string
 */
export const getSindhiFontClass = (text?: string | null, baseClass: string = 'sindhi-text'): string => {
  return containsSindhiText(text) ? baseClass : '';
};

/**
 * Creates a mixed content renderer that applies Sindhi fonts only to appropriate parts
 * @param text - The text to process
 * @param baseClass - Base CSS class for Sindhi text
 * @returns Object with processed text and classes
 */
export const processMixedContent = (text: string, baseClass: string = 'sindhi-text') => {
  // Split text by numbers and Sindhi text
  const parts = text.split(/(\d+)/);
  
  return parts.map((part, index) => {
    const isNumber = /^\d+$/.test(part);
    const isSindhi = containsSindhiText(part);
    
    return {
      text: part,
      className: isSindhi ? baseClass : (isNumber ? 'font-mono' : ''),
      isNumber,
      isSindhi
    };
  });
};

/**
 * Applies appropriate font classes based on content type
 * @param text - The text to process
 * @param options - Configuration options
 * @returns CSS class string
 */
export const getSmartFontClass = (
  text?: string | null,
  options: {
    baseClass?: string;
    headingClass?: string;
    numberClass?: string;
    isHeading?: boolean;
  } = {}
): string => {
  if (!text) return '';
  
  const {
    baseClass = 'sindhi-text',
    headingClass = 'sindhi-heading',
    numberClass = 'font-mono',
    isHeading = false
  } = options;
  
  const isSindhi = containsSindhiText(text);
  const isNumber = /^\d+$/.test(text);
  
  if (isNumber) return numberClass;
  if (isSindhi) return isHeading ? headingClass : baseClass;
  return '';
};

/**
 * Heading-specific font class generator
 * @param level - Heading level (1-6)
 * @param text - The text content
 * @returns CSS class string
 */
export const getHeadingFontClass = (level: number, text?: string | null): string => {
  const baseClass = `sindhi-heading-${level}`;
  return getSmartFontClass(text, { 
    baseClass, 
    headingClass: baseClass, 
    isHeading: true 
  });
};

/**
 * Modern font classes - Clean & Minimal
 */
export const FONT_CLASSES = {
  // Base classes
  sindhi: 'font-sindhi',
  english: 'font-inter',
  number: 'number',
  
  // Heading classes
  h1: 'text-h1',
  h2: 'text-h2', 
  h3: 'text-h3',
  h4: 'text-h4',
  h5: 'text-h5',
  h6: 'text-h6',
  
  // Size classes
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  
  // Weight classes
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
} as const;

/**
 * React component props for Sindhi font handling
 */
export interface SindhiFontProps {
  text?: string | null;
  isHeading?: boolean;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Hook for Sindhi font utilities
 */
export const useSindhiFont = () => {
  return {
    containsSindhiText,
    getSindhiFontClass,
    processMixedContent,
    getSmartFontClass,
    getHeadingFontClass,
    FONT_CLASSES
  };
};
