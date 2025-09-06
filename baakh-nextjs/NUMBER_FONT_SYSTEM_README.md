# Number Font System - Universal Font for Numbers

## Overview

This system ensures that numbers are displayed with consistent fonts across both `/sd` (Sindhi) and `/en` (English) versions of the application. Numbers will always use the same monospace font regardless of the surrounding text language.

## Key Features

- **Universal Consistency**: Numbers look identical in both `/sd` and `/en` versions
- **Automatic Detection**: Smart detection of numbers in mixed content
- **Multiple Components**: Various components for different use cases
- **CSS Classes**: Direct CSS classes for styling
- **Predefined Configurations**: Ready-to-use font configurations

## Components

### 1. NumberFont Component

Basic component for rendering numbers with consistent font.

```tsx
import { NumberFont } from '@/components/ui/NumberFont';

// Basic usage
<NumberFont>123</NumberFont>

// With custom styling
<NumberFont weight="bold" size="lg" className="text-blue-600">
  2024
</NumberFont>
```

**Props:**
- `children`: The number content
- `className`: Additional CSS classes
- `weight`: Font weight (thin, light, normal, medium, semibold, bold, extrabold, black)
- `size`: Font size (xs, sm, base, lg, xl, 2xl)
- `variant`: Font variant (mono, tabular)

### 2. MixedContentWithNumbers Component

Handles mixed content (Sindhi/English/Numbers) with proper font application.

```tsx
import { MixedContentWithNumbers } from '@/components/ui/NumberFont';

// Mixed content
<MixedContentWithNumbers text="سنڌي text with 123 numbers" />

// With custom classes
<MixedContentWithNumbers 
  text="English 456 and سنڌي 789"
  sindhiClass="sindhi-text-lg"
  englishClass="font-serif"
  numberClass="number-font-bold"
/>
```

**Props:**
- `text`: The mixed content text
- `className`: Additional CSS classes
- `sindhiClass`: CSS class for Sindhi text (default: 'sindhi-text')
- `englishClass`: CSS class for English text (default: 'font-sans')
- `numberClass`: CSS class for numbers (default: 'number-font')
- `preserveWhitespace`: Whether to preserve whitespace (default: true)

### 3. SmartNumber Component

Automatically detects if content is a number and applies appropriate font.

```tsx
import { SmartNumber } from '@/components/ui/NumberFont';

// Automatically detects and styles numbers
<SmartNumber>123</SmartNumber>  // Uses number font
<SmartNumber>abc</SmartNumber>   // Uses fallback font
```

**Props:**
- `children`: The content to check
- `className`: Additional CSS classes
- `weight`: Font weight for numbers
- `size`: Font size for numbers
- `fallbackClass`: CSS class for non-number content (default: 'font-sans')

### 4. NumberText Component (Enhanced)

Enhanced version with predefined configurations.

```tsx
import { NumberText } from '@/components/ui/NumberFont';

// Using predefined configurations
<NumberText config="heading">2024</NumberText>
<NumberText config="small">Page 5</NumberText>
<NumberText config="large">1,234,567</NumberText>

// Using custom props
<NumberText weight="bold" size="xl" variant="tabular">
  99.99
</NumberText>
```

**Props:**
- `children`: The number content
- `className`: Additional CSS classes
- `weight`: Font weight
- `size`: Font size
- `variant`: Font variant (mono, tabular)
- `config`: Predefined configuration (basic, heading, small, large, tabular)

## CSS Classes

### Direct CSS Classes

```tsx
// Basic number font
<span className="number-font">123</span>

// With weight and size
<span className="number-font-bold number-text-lg">2024</span>

// Tabular numbers (for data tables)
<span className="font-mono tabular-nums">123.45</span>
```

### Available Classes

**Base Classes:**
- `number-font` - Basic number font
- `font-mono` - Monospace font (same as number-font)

**Weight Classes:**
- `number-font-thin` - Font weight 100
- `number-font-extralight` - Font weight 200
- `number-font-light` - Font weight 300
- `number-font-normal` - Font weight 400
- `number-font-medium` - Font weight 500
- `number-font-semibold` - Font weight 600
- `number-font-bold` - Font weight 700
- `number-font-extrabold` - Font weight 800
- `number-font-black` - Font weight 900

**Size Classes:**
- `number-text-xs` - Extra small (0.75rem)
- `number-text-sm` - Small (0.875rem)
- `number-text-base` - Base (1rem)
- `number-text-lg` - Large (1.125rem)
- `number-text-xl` - Extra large (1.25rem)
- `number-text-2xl` - 2X large (1.5rem)

### Mixed Content Classes

```tsx
// Universal mixed content (works in both /sd and /en)
<span className="universal-mixed">
  <span className="sindhi-text">سنڌي</span>
  <span className="number-font" data-number="true">123</span>
  <span className="font-sans">English</span>
</span>
```

## Utility Functions

### useNumberFont Hook

```tsx
import { useNumberFont } from '@/components/ui/NumberFont';

function MyComponent() {
  const {
    isNumberOnly,
    containsNumbers,
    extractNumbers,
    getNumberFontClass,
    processMixedContentWithNumbers,
    createNumberFontClass
  } = useNumberFont();

  // Check if text is only numbers
  const isNumber = isNumberOnly("123"); // true

  // Get appropriate font class
  const fontClass = getNumberFontClass("123"); // "number-font"

  // Process mixed content
  const parts = processMixedContentWithNumbers("سنڌي 123 English");
}
```

### Direct Utility Functions

```tsx
import { 
  isNumberOnly,
  containsNumbers,
  extractNumbers,
  getNumberFontClass,
  processMixedContentWithNumbers,
  createNumberFontClass,
  NUMBER_FONT_CLASS,
  NUMBER_FONT_FAMILY
} from '@/lib/number-font-utils';

// Check if text contains only numbers
const isNumber = isNumberOnly("123"); // true

// Check if text contains numbers
const hasNumbers = containsNumbers("abc123def"); // true

// Extract numbers from text
const numbers = extractNumbers("abc123def456"); // ["123", "456"]

// Get font class for numbers
const fontClass = getNumberFontClass("123"); // "number-font"

// Create complete font class
const completeClass = createNumberFontClass({
  weight: 'bold',
  size: 'lg',
  className: 'text-blue-600'
}); // "number-font font-bold text-lg text-blue-600"
```

## Predefined Configurations

```tsx
import { getNumberFontConfig } from '@/lib/number-font-utils';

// Available configurations
const basic = getNumberFontConfig('basic');     // Basic styling
const heading = getNumberFontConfig('heading'); // For headings
const small = getNumberFontConfig('small');     // For small numbers
const large = getNumberFontConfig('large');     // For large numbers
const tabular = getNumberFontConfig('tabular'); // For data tables
```

## Integration with Existing Components

### Updating SindhiText Component

The existing `SindhiText` component has been updated to use the new number font system:

```tsx
import { MixedContent } from '@/components/ui/SindhiText';

// Use universal number font (default)
<MixedContent text="سنڌي 123 English" useUniversalNumberFont={true} />

// Use legacy system
<MixedContent text="سنڌي 123 English" useUniversalNumberFont={false} />
```

### CSS Integration

The system automatically applies consistent number fonts based on the locale:

```css
/* Numbers in Sindhi version (/sd) */
[lang="sd"] .number,
[lang="sd"] [data-number="true"] {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace !important;
}

/* Numbers in English version (/en) */
[lang="en"] .number,
[lang="en"] [data-number="true"] {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace !important;
}
```

## Best Practices

1. **Use NumberFont for pure numbers**: When you know the content is a number
2. **Use MixedContentWithNumbers for mixed content**: When text contains numbers mixed with other content
3. **Use SmartNumber for dynamic content**: When you're not sure if content is a number
4. **Use predefined configurations**: For consistent styling across the application
5. **Use CSS classes directly**: For simple cases where you don't need React components

## Examples

### Poetry with Numbers

```tsx
// Sindhi poetry with year
<MixedContentWithNumbers text="سنڌي شاعري 2024 ۾ 1500 شعر" />

// English poetry with year
<MixedContentWithNumbers text="English poetry 2024 with 1500 poems" />
```

### Statistics Display

```tsx
// Large numbers for statistics
<NumberText config="large">1,234,567</NumberText>

// Small numbers for pagination
<NumberText config="small">Page 5 of 20</NumberText>
```

### Data Tables

```tsx
// Tabular numbers for data tables
<NumberText config="tabular">99.99</NumberText>
<NumberText variant="tabular">123.45</NumberText>
```

### Dynamic Content

```tsx
// Smart detection for dynamic content
{items.map(item => (
  <SmartNumber key={item.id}>
    {item.count}
  </SmartNumber>
))}
```

## Testing

Visit `/number-font-test` to see a comprehensive demo of all the number font components and features.

## Migration Guide

If you're updating existing code:

1. **Replace direct number styling**:
   ```tsx
   // Before
   <span className="font-mono">123</span>
   
   // After
   <NumberFont>123</NumberFont>
   ```

2. **Update mixed content**:
   ```tsx
   // Before
   <MixedContent text="سنڌي 123" />
   
   // After
   <MixedContent text="سنڌي 123" useUniversalNumberFont={true} />
   ```

3. **Use new CSS classes**:
   ```tsx
   // Before
   <span className="sindhi-number">123</span>
   
   // After
   <span className="number-font">123</span>
   ```

This system ensures that numbers are always displayed consistently across both language versions of your application, providing a better user experience and maintaining visual consistency.
