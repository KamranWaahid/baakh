'use client';

import React from 'react';
import { 
  useNumberFont, 
  NumberFontProps, 
  createNumberFontClass,
  processMixedContentWithNumbers,
  isNumberOnly 
} from '@/lib/number-font-utils';

/**
 * NumberFont Component
 * Renders numbers with consistent font across all locales (/sd and /en)
 */
export const NumberFont: React.FC<NumberFontProps> = ({ 
  children, 
  className = '', 
  weight = 'medium', 
  size = 'base',
  ...props 
}) => {
  // Modern font system - Clean & Minimal
  const fontClass = 'number';
  const sizeClass = `text-${size}`;
  const weightClass = `font-${weight}`;

  return (
    <span 
      className={`${fontClass} ${sizeClass} ${weightClass} ${className}`} 
      data-number="true"
      {...props}
    >
      {children}
    </span>
  );
};

/**
 * MixedContentWithNumbers Component
 * Handles mixed content (Sindhi/English/Numbers) with proper font application
 * Numbers always use Inter font regardless of locale
 */
export const MixedContentWithNumbers: React.FC<{
  text: string;
  className?: string;
  sindhiClass?: string;
  englishClass?: string;
  numberClass?: string;
  preserveWhitespace?: boolean;
}> = ({ 
  text, 
  className = '', 
  sindhiClass = 'sindhi-text',
  englishClass = 'font-sans',
  numberClass = 'number-font',
  preserveWhitespace = true 
}) => {
  const parts = processMixedContentWithNumbers(text, {
    sindhiClass,
    englishClass,
    numberClass,
    preserveWhitespace
  });

  return (
    <span className={`universal-mixed ${className}`}>
      {parts.map((part, index) => (
        <span 
          key={index} 
          className={`${part.className} ${part.isNumber ? 'number' : ''}`} 
          data-number={part.isNumber ? 'true' : undefined}
        >
          {part.text}
        </span>
      ))}
    </span>
  );
};

/**
 * SmartNumber Component
 * Automatically detects if content is a number and applies appropriate font
 */
export const SmartNumber: React.FC<{
  children: React.ReactNode;
  className?: string;
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  fallbackClass?: string;
}> = ({ 
  children, 
  className = '', 
  weight = 'medium', 
  size = 'base',
  fallbackClass = 'font-sans',
  ...props 
}) => {
  const content = String(children);
  const isNumber = isNumberOnly(content);
  
  if (isNumber) {
    return (
      <NumberFont 
        className={className} 
        weight={weight} 
        size={size}
        {...props}
      >
        {children}
      </NumberFont>
    );
  }
  
  return (
    <span className={`${fallbackClass} ${className}`} {...props}>
      {children}
    </span>
  );
};

/**
 * NumberText Component (Enhanced)
 * Enhanced version of the existing NumberText with more options
 */
export const NumberText: React.FC<{
  children: React.ReactNode;
  className?: string;
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  variant?: 'mono' | 'tabular';
  config?: 'basic' | 'heading' | 'small' | 'large' | 'tabular';
}> = ({ 
  children, 
  className = '', 
  weight, 
  size, 
  variant,
  config,
  ...props 
}) => {
  const { createNumberFontClass } = useNumberFont();
  
  // Use predefined config if specified
  if (config) {
    const fontClass = createNumberFontClass({
      className,
      weight: 'normal',
      size: 'base',
      variant: config === 'tabular' ? 'tabular' : 'mono'
    } as any);
    
    return (
      <span className={fontClass} {...props}>
        {children}
      </span>
    );
  }
  
  // Use provided props or defaults
  return (
    <NumberFont 
      className={className}
      weight={weight}
      size={size}
      variant={variant}
      {...props}
    >
      {children}
    </NumberFont>
  );
};

/**
 * Hook for using number font utilities in components
 */
export const useNumberFontComponent = () => {
  const utils = useNumberFont();
  
  return {
    ...utils,
    NumberFont,
    MixedContentWithNumbers,
    SmartNumber,
    NumberText
  };
};

export default NumberFont;
