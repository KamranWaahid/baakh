# Font Usage Guide

This document explains how to use the fonts in your Baakh poetry platform.

## Available Fonts

### 1. Amiri Font (Poetry & Couplets)
- **Purpose**: Primary font for poetry couplets and Sindhi text
- **Best for**: Poetry content, couplets, headings in Sindhi
- **Characteristics**: Excellent for Arabic/Persian/Sindhi scripts

### 2. Lateef Font (General Content)
- **Purpose**: Secondary font for general content
- **Best for**: Descriptions, metadata, UI text in Sindhi
- **Characteristics**: Good readability for longer text

### 3. Inter Font (UI Elements)
- **Purpose**: Default font for UI elements
- **Best for**: Buttons, navigation, English text
- **Characteristics**: Modern, clean sans-serif

### 4. Source Serif 4 (English Content)
- **Purpose**: Serif font for English content
- **Best for**: English poetry, articles, long-form content
- **Characteristics**: Elegant serif with good readability

## Usage Examples

### Basic Font Classes

```tsx
// Poetry and couplets
<div className="font-amiri text-lg">
  سنڌي شاعريءَ جو وڏو خزانو
</div>

// General Sindhi content
<div className="font-lateef text-base">
  مختلف شاعرن جي شاعري
</div>

// UI elements
<button className="font-sans">
  Click me
</button>
```

### Utility Classes

```tsx
// Pre-configured poetry styles
<div className="font-poetry">
  سنڌي شاعري
</div>

// Pre-configured couplet styles
<div className="font-couplet">
  شاعر جو شعر
</div>

// Pre-configured Sindhi text styles
<div className="font-sindhi">
  سنڌي متن
</div>
```

### Conditional Font Usage

```tsx
// Use different fonts based on language
const isSindhi = pathname?.startsWith('/sd');

<div className={`text-lg ${isSindhi ? 'font-amiri' : 'font-serif'}`}>
  {couplet.content}
</div>

<div className={`text-sm ${isSindhi ? 'font-lateef' : 'font-sans'}`}>
  {couplet.translation}
</div>
```

## Font Variables

The fonts are available as CSS variables:

```css
:root {
  --font-amiri: 'Amiri', 'Noto Naskh Arabic', serif;
  --font-lateef: 'Lateef', 'Noto Naskh Arabic', serif;
  --font-inter: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-source-serif: 'Source Serif 4', Georgia, serif;
}
```

## Tailwind Classes

You can use these Tailwind classes:

```tsx
// Font families
<div className="font-amiri">Amiri font</div>
<div className="font-lateef">Lateef font</div>
<div className="font-poetry">Poetry style</div>
<div className="font-couplet">Couplet style</div>
<div className="font-sindhi">Sindhi style</div>

// Combined with other utilities
<div className="font-amiri text-xl font-bold text-center">
  سنڌي شاعري
</div>
```

## Best Practices

1. **Poetry Content**: Always use `font-amiri` for couplets and poetry
2. **Descriptions**: Use `font-lateef` for Sindhi descriptions and metadata
3. **UI Elements**: Use `font-sans` (Inter) for buttons and navigation
4. **English Content**: Use `font-serif` (Source Serif 4) for English text
5. **Responsive**: Fonts automatically scale with your text size classes

## Example Component

```tsx
export function PoetryCard({ couplet, isSindhi }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={`text-lg leading-relaxed ${isSindhi ? 'font-amiri' : 'font-serif'}`}>
          {couplet.content}
        </CardTitle>
        {couplet.translation && (
          <p className={`text-sm text-muted-foreground mt-2 ${isSindhi ? 'font-lateef' : 'font-sans'}`}>
            {couplet.translation}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className={`flex items-center ${isSindhi ? 'font-lateef' : 'font-sans'}`}>
          <User className="w-4 h-4 mr-1" />
          {couplet.poet}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Font Showcase Component

Use the `FontShowcase` component to see examples of all fonts:

```tsx
import { FontShowcase } from '@/components/ui/font-showcase';

export default function FontDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <FontShowcase />
    </div>
  );
}
```

This will display examples of all fonts with sample text to help you choose the right font for each use case.
