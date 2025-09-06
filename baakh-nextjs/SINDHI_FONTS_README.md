# Sindhi Fonts - Quick Start Guide

## 🎯 **What's Available**

Your application now has a complete Sindhi font system with:

- **Google Fonts**: Lateef, Noto Nastaliq Arabic, Amiri, Noto Naskh Arabic
- **CSS Variables**: Easy-to-use font family variables
- **Utility Classes**: Tailwind-style classes for quick styling
- **Auto-apply**: Automatic font application based on locale

## 🚀 **How to Use**

### **1. Basic Font Classes (Tailwind)**

```tsx
<div className="font-sindhi-primary">سنڌي متن</div>
<div className="font-sindhi-nastaliq">سنڌي متن</div>
<div className="font-sindhi-naskh">سنڌي متن</div>
```

### **2. Utility Classes (Custom CSS)**

```tsx
<div className="sindhi-text-lg">سنڌي متن</div>
<div className="sindhi-heading">سنڌي عنوان</div>
<div className="sindhi-body">سنڌي متن</div>
<div className="sindhi-caption">سنڌي کیپشن</div>
```

### **3. Auto-apply Fonts**

```tsx
<div className="auto-sindhi-font">سنڌي متن - Automatically uses Sindhi fonts</div>
```

### **4. RTL Support**

```tsx
<div className="sindhi-rtl" dir="rtl">سنڌي متن RTL سان</div>
```

### **5. CSS Variables**

```tsx
<div style={{ fontFamily: 'var(--font-sindhi-primary)' }}>
  سنڌي متن - Using CSS variable
</div>
```

## 📱 **Font Sizes Available**

- `sindhi-text-xs` - Extra small
- `sindhi-text-sm` - Small  
- `sindhi-text-base` - Base size
- `sindhi-text-lg` - Large
- `sindhi-text-xl` - Extra large
- `sindhi-text-2xl` - 2X large

## 🎨 **Font Weights Available**

- `sindhi-font-light` - Light (300)
- `sindhi-font-normal` - Normal (400)
- `sindhi-font-medium` - Medium (500)
- `sindhi-font-semibold` - Semi-bold (600)
- `sindhi-font-bold` - Bold (700)

## 🔧 **Adding to Existing Components**

### **Option 1: Add classes to existing elements**

```tsx
// Before
<input className="border rounded px-3 py-2" />

// After  
<input className="border rounded px-3 py-2 auto-sindhi-font" />
```

### **Option 2: Use the demo component**

```tsx
import { SindhiFontDemo } from '@/components/ui/SindhiFontDemo';

export default function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <SindhiFontDemo />
    </div>
  );
}
```

## 🧪 **Testing**

Visit `/sindhi-font-test` to see all fonts in action and verify they're working correctly.

## 📝 **Example Usage in Forms**

```tsx
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium sindhi-text-base">
      سنڌي نالو
    </label>
    <input 
      className="mt-1 block w-full border rounded-md px-3 py-2 auto-sindhi-font"
      placeholder="سنڌي پلیس ہولڈر"
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium sindhi-text-base">
      سنڌي تفصیل
    </label>
    <textarea 
      className="mt-1 block w-full border rounded-md px-3 py-2 auto-sindhi-font"
      rows={4}
      placeholder="سنڌي تفصیل لکھو"
    />
  </div>
</div>
```

## 🎯 **Quick Tips**

1. **Use `auto-sindhi-font`** for the easiest implementation
2. **Use `font-sindhi-primary`** for consistent primary font
3. **Use `sindhi-rtl`** for right-to-left text support
4. **Test with `/sindhi-font-test`** to verify fonts are loading

## 🔍 **Troubleshooting**

If fonts aren't working:
1. Check browser console for errors
2. Verify the page loads without errors
3. Check if Google Fonts are blocked by ad blockers
4. Test with the `/sindhi-font-test` page
