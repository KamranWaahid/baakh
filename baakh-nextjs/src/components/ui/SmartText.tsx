'use client';

import React from 'react';
import { 
  getSmartFontClass, 
  processMixedContent,
  shouldUseInterFont,
  shouldUseSindhiFont,
  SmartFontProps 
} from '@/lib/font-detection-utils';

/**
 * SmartText Component
 * Automatically applies appropriate fonts based on content analysis
 * Prevents Sindhi fonts from being applied to numbers and English characters
 * Use this component anywhere you need smart font detection
 */
export const SmartText: React.FC<SmartFontProps & { 
  as?: keyof JSX.IntrinsicElements;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  processMixed?: boolean;
}> = ({ 
  text, 
  children, 
  as: Component = 'span',
  size = 'base',
  weight = 'normal',
  className = '',
  defaultFont = 'inter',
  processMixed = false,
  ...props 
}) => {
  const content = text || children;
  const contentString = typeof content === 'string' ? content : String(content);
  
  // If processMixed is true, handle mixed content
  if (processMixed) {
    const parts = processMixedContent(contentString);
    const sizeClass = `text-${size}`;
    
    return (
      <Component className={className} {...props}>
        {parts.map((part, index) => (
          <span 
            key={index} 
            className={`${part.className} ${sizeClass} ${part.isNumber ? 'number' : ''}`} 
            data-number={part.isNumber ? 'true' : undefined}
          >
            {part.text}
          </span>
        ))}
      </Component>
    );
  }
  
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
 * SmartHeading Component
 * Automatically applies appropriate fonts to headings based on content analysis
 */
export const SmartHeading: React.FC<{
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
 * NumberText Component
 * Ensures numbers always use Inter font regardless of locale
 */
export const NumberText: React.FC<{
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}> = ({ children, className = '', size = 'base', weight = 'medium', ...props }) => {
  const sizeClass = `text-${size}`;
  const weightClass = `font-${weight}`;
  
  return (
    <span className={`number ${sizeClass} ${weightClass} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default SmartText;
