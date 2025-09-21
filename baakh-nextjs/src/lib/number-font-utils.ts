/**
 * Number Font Utilities
 * Provides consistent number font handling across all locales (/sd and /en)
 * Ensures numbers always use the same font regardless of Sindhi font settings
 */

/**
 * Modern number font class - Clean & Minimal
 * Uses Helvetica Now Text Regular font for consistent number display across all locales
 */
export const NUMBER_FONT_CLASS = 'number';

/**
 * Modern number font family - Helvetica Now Text Regular for consistency
 */
export const NUMBER_FONT_FAMILY = "'Helvetica Now Text Regular','Helvetica Now Text Regular Placeholder',sans-serif";

/**
 * Checks if text contains only numbers
 * @param text - The text to check
 * @returns boolean indicating if text contains only numbers
 */
export const isNumberOnly = (text?: string | null): boolean => {
  if (!text) return false;
  return /^\d+$/.test(text.trim());
};

/**
 * Checks if text contains numbers (mixed with other characters)
 * @param text - The text to check
 * @returns boolean indicating if text contains numbers
 */
export const containsNumbers = (text?: string | null): boolean => {
  if (!text) return false;
  return /\d/.test(text);
};

/**
 * Extracts numbers from mixed text
 * @param text - The text to process
 * @returns Array of number strings found in the text
 */
export const extractNumbers = (text?: string | null): string[] => {
  if (!text) return [];
  return text.match(/\d+/g) || [];
};

/**
 * Applies number font class to text that contains only numbers
 * @param text - The text to check
 * @param additionalClasses - Additional CSS classes to apply
 * @returns CSS class string
 */
export const getNumberFontClass = (
  text?: string | null, 
  additionalClasses: string = ''
): string => {
  if (!isNumberOnly(text)) return '';
  return [NUMBER_FONT_CLASS, additionalClasses].filter(Boolean).join(' ');
};

/**
 * Processes mixed content and applies appropriate fonts
 * Numbers get monospace font, other content gets default font
 * @param text - The text to process
 * @param options - Configuration options
 * @returns Array of processed text parts with appropriate classes
 */
export const processMixedContentWithNumbers = (
  text: string,
  options: {
    sindhiClass?: string;
    englishClass?: string;
    numberClass?: string;
    preserveWhitespace?: boolean;
  } = {}
) => {
  const {
    sindhiClass = 'sindhi-text',
    englishClass = 'font-sans',
    numberClass = NUMBER_FONT_CLASS,
    preserveWhitespace = true
  } = options;

  // Split text by numbers while preserving the numbers
  const parts = text.split(/(\d+)/);
  
  return parts.map((part, index) => {
    const trimmedPart = part.trim();
    const isNumber = isNumberOnly(part);
    const isSindhi = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(part);
    const isWhitespace = preserveWhitespace && /^\s+$/.test(part);
    
    let className = '';
    if (isNumber) {
      className = numberClass;
    } else if (isSindhi) {
      className = sindhiClass;
    } else if (!isWhitespace) {
      className = englishClass;
    }
    
    return {
      text: part,
      className,
      isNumber,
      isSindhi,
      isWhitespace
    };
  });
};

/**
 * Universal number font component props
 */
export interface NumberFontProps {
  children: React.ReactNode;
  className?: string;
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  variant?: 'mono' | 'tabular';
}

/**
 * Gets the appropriate font weight class for numbers
 * @param weight - Font weight
 * @returns CSS class string
 */
export const getNumberWeightClass = (weight: string = 'medium'): string => {
  const weightMap: Record<string, string> = {
    thin: 'font-thin',
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black'
  };
  
  return weightMap[weight] || 'font-medium';
};

/**
 * Gets the appropriate font size class for numbers
 * @param size - Font size
 * @returns CSS class string
 */
export const getNumberSizeClass = (size: string = 'base'): string => {
  const sizeMap: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };
  
  return sizeMap[size] || 'text-base';
};

/**
 * Creates a complete number font class string
 * @param props - Number font properties
 * @returns Complete CSS class string
 */
export const createNumberFontClass = (props: Omit<NumberFontProps, 'children'> = {}): string => {
  const {
    className = '',
    weight = 'medium',
    size = 'base',
    variant = 'mono'
  } = props;
  
  const baseClass = variant === 'tabular' ? 'font-mono tabular-nums' : NUMBER_FONT_CLASS;
  const weightClass = getNumberWeightClass(weight);
  const sizeClass = getNumberSizeClass(size);
  
  return [baseClass, weightClass, sizeClass, className].filter(Boolean).join(' ');
};

/**
 * Hook for number font utilities
 */
export const useNumberFont = () => {
  return {
    isNumberOnly,
    containsNumbers,
    extractNumbers,
    getNumberFontClass,
    processMixedContentWithNumbers,
    getNumberWeightClass,
    getNumberSizeClass,
    createNumberFontClass,
    NUMBER_FONT_CLASS,
    NUMBER_FONT_FAMILY
  };
};

/**
 * Predefined number font configurations
 */
export const NUMBER_FONT_CONFIGS = {
  // Basic number styling
  basic: {
    class: NUMBER_FONT_CLASS,
    weight: 'medium',
    size: 'base'
  },
  
  // Heading numbers
  heading: {
    class: NUMBER_FONT_CLASS,
    weight: 'semibold',
    size: 'lg'
  },
  
  // Small numbers (like pagination)
  small: {
    class: NUMBER_FONT_CLASS,
    weight: 'normal',
    size: 'sm'
  },
  
  // Large numbers (like statistics)
  large: {
    class: NUMBER_FONT_CLASS,
    weight: 'bold',
    size: 'xl'
  },
  
  // Tabular numbers (for data tables)
  tabular: {
    class: 'font-mono tabular-nums',
    weight: 'medium',
    size: 'base'
  }
} as const;

/**
 * Gets a predefined number font configuration
 * @param configName - Name of the configuration
 * @returns Configuration object
 */
export const getNumberFontConfig = (configName: keyof typeof NUMBER_FONT_CONFIGS) => {
  return NUMBER_FONT_CONFIGS[configName];
};
