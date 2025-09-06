'use client';

import React from 'react';
import { 
  getSmartFontClass, 
  processMixedContent,
  shouldUseInterFont,
  shouldUseSindhiFont,
  SmartFontProps 
} from '@/lib/font-detection-utils';
import { 
  processMixedContentWithNumbers,
  isNumberOnly,
  createNumberFontClass 
} from '@/lib/number-font-utils';

/**
 * SindhiText Component
 * Automatically applies appropriate fonts based on content analysis
 * Prevents Sindhi fonts from being applied to numbers and English characters
 */
export const SindhiText: React.FC<SmartFontProps & { 
  as?: keyof JSX.IntrinsicElements;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}> = ({ 
  text, 
  children, 
  as: Component = 'span',
  size = 'base',
  weight = 'normal',
  className = '',
  defaultFont = 'inter',
  ...props 
}) => {
  const content = text || children;
  const contentString = typeof content === 'string' ? content : String(content);
  
  // Smart font detection - prevents Sindhi fonts on numbers and English characters
  const fontClass = getSmartFontClass(contentString, `font-${defaultFont}`);
  const sizeClass = `text-${size}`;
  const weightClass = weight !== 'normal' ? `font-${weight}` : '';
  
  // Combine all classes
  const combinedClassName = [fontClass, sizeClass, weightClass, className].filter(Boolean).join(' ');

  return (
    <Component className={combinedClassName} {...props}>
      {content}
    </Component>
  );
};

/**
 * SindhiHeading Component
 * Specialized component for headings with proper sizing
 */
export const SindhiHeading: React.FC<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}> = ({ level, children, className = '', weight = 'bold', ...props }) => {
  const contentString = typeof children === 'string' ? children : String(children);
  
  // Smart font detection for headings - prevents Sindhi fonts on numbers and English characters
  const fontClass = getSmartFontClass(contentString, 'font-inter');
  const headingClass = `text-h${level}`;
  const weightClass = weight !== 'bold' ? `font-${weight}` : '';
  
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  const combinedClassName = [fontClass, headingClass, weightClass, className].filter(Boolean).join(' ');

  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
};

/**
 * MixedContent Component
 * Handles mixed Sindhi/English/Number content with consistent number fonts
 */
export const MixedContent: React.FC<{
  text: string;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  useUniversalNumberFont?: boolean;
}> = ({ text, className = '', size = 'base', useUniversalNumberFont = true }) => {
  // Smart font detection - prevents Sindhi fonts on numbers and English characters
  const parts = processMixedContent(text);
  const sizeClass = `text-${size}`;
  
  return (
    <span className={`${className}`}>
      {parts.map((part, index) => (
        <span 
          key={index} 
          className={`${part.className} ${sizeClass} ${part.isNumber ? 'number' : ''}`} 
          data-number={part.isNumber ? 'true' : undefined}
        >
          {part.text}
        </span>
      ))}
    </span>
  );
};

/**
 * NumberText Component
 * Ensures numbers always use consistent monospace font across all locales
 */
export const NumberText: React.FC<{
  children: React.ReactNode;
  className?: string;
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  variant?: 'mono' | 'tabular';
}> = ({ 
  children, 
  className = '', 
  weight = 'medium', 
  size = 'base',
  variant = 'mono',
  ...props 
}) => {
  const fontClass = createNumberFontClass({ 
    className, 
    weight, 
    size, 
    variant 
  });

  return (
    <span className={fontClass} {...props}>
      {children}
    </span>
  );
};

/**
 * Hook for using Sindhi font utilities in components
 */
export const useSindhiFont = () => {
  return {
    getSmartFontClass,
    getHeadingFontClass,
    processMixedContent,
    containsSindhiText
  };
};
