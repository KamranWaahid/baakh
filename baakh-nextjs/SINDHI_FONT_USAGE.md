# Sindhi Font Usage Guide for Admin Panel

This guide shows how to use the comprehensive Sindhi font classes that have been added to the admin panel CSS.

## 🎯 **Available Sindhi Font Classes**

### **Base Font Classes**
```css
.sindhi-text          /* Basic Sindhi text with MB Lateefi SK 2.0 font */
.sindhi-heading       /* Sindhi heading with medium weight */
.sindhi-body          /* Sindhi body text with larger size and line height */
.sindhi-caption       /* Sindhi caption text for small descriptions */
```

### **Typography Sizes**
```css
.sindhi-text-xs       /* Extra small: 0.75rem */
.sindhi-text-sm       /* Small: 0.875rem */
.sindhi-text-base     /* Base: 1rem */
.sindhi-text-lg       /* Large: 1.125rem */
.sindhi-text-xl       /* Extra large: 1.25rem */
.sindhi-text-2xl      /* 2X large: 1.5rem */
```

### **Font Weights**
```css
.sindhi-font-light    /* Weight: 300 */
.sindhi-font-normal   /* Weight: 400 */
.sindhi-font-medium   /* Weight: 500 */
.sindhi-font-semibold /* Weight: 600 */
.sindhi-font-bold     /* Weight: 700 */
```

### **Text Alignment**
```css
.sindhi-text-left     /* Left align */
.sindhi-text-center   /* Center align */
.sindhi-text-right    /* Right align */
```

### **Line Heights**
```css
.sindhi-leading-tight    /* Line height: 1.25 */
.sindhi-leading-snug     /* Line height: 1.375 */
.sindhi-leading-normal   /* Line height: 1.5 */
.sindhi-leading-relaxed  /* Line height: 1.625 */
.sindhi-leading-loose    /* Line height: 2 */
```

### **Letter Spacing**
```css
.sindhi-tracking-tighter /* Letter spacing: -0.05em */
.sindhi-tracking-tight   /* Letter spacing: -0.025em */
.sindhi-tracking-normal  /* Letter spacing: 0em */
.sindhi-tracking-wide    /* Letter spacing: 0.025em */
.sindhi-tracking-wider   /* Letter spacing: 0.05em */
```

### **RTL Support**
```css
.sindhi-rtl            /* Right-to-left text direction */
```

## 📝 **Usage Examples**

### **1. Basic Sindhi Text**
```tsx
<p className="sindhi-text">
  سنڌي ٻولي ۾ متن
</p>
```

### **2. Sindhi Headings**
```tsx
<h2 className="sindhi-heading sindhi-text-2xl">
  سنڌي عنوان
</h2>
```

### **3. Sindhi Form Labels**
```tsx
<Label className="sindhi-label sindhi-text-base">
  سنڌي ليبل
</Label>
```

### **4. Sindhi Input Fields**
```tsx
<Input 
  className="sindhi-input sindhi-rtl"
  placeholder="سنڌي پليس هولڊر"
  dir="rtl"
/>
```

### **5. Sindhi Textarea**
```tsx
<Textarea 
  className="sindhi-textarea sindhi-rtl"
  placeholder="سنڌي متن شامل ڪريو"
  dir="rtl"
/>
```

### **6. Sindhi Captions**
```tsx
<p className="sindhi-caption sindhi-text-muted">
  سنڌي تفصيل
</p>
```

### **7. Combined Classes**
```tsx
<div className="sindhi-text sindhi-text-lg sindhi-font-medium sindhi-text-center">
  سنڌي متن جي مختلف سيٽنگز
</div>
```

## 🎨 **Common Use Cases in Admin Panel**

### **Poetry Creation Forms**
```tsx
// Hesudhar input
<Input 
  className="sindhi-input sindhi-rtl border-[#E5E5E5] focus:border-[#1F1F1F]"
  placeholder="سنڌي شاعري شامل ڪريو"
  dir="rtl"
/>

// Poetry details
<Label className="sindhi-label text-[#1F1F1F] font-medium">
  سنڌي تفصيل
</Label>
```

### **Poet Information**
```tsx
// Poet name in Sindhi
<h3 className="sindhi-heading sindhi-text-xl text-[#1F1F1F]">
  شاھ عبداللطيف
</h3>

// Poet bio
<p className="sindhi-body text-[#6B6B6B]">
  سنڌي شاعر جي تفصيل
</p>
```

### **Category Names**
```tsx
// Category title in Sindhi
<CardTitle className="sindhi-heading text-[#1F1F1F]">
  سنڌي ڪيٽگري
</CardTitle>

// Category description
<CardDescription className="sindhi-caption text-[#6B6B6B]">
  سنڌي تفصيل
</CardDescription>
```

### **Tags and Labels**
```tsx
// Tag in Sindhi
<Badge className="sindhi-text-sm bg-[#F4F4F5] text-[#1F1F1F]">
  سنڌي ٽيگ
</Badge>
```

## 🔧 **Technical Details**

### **Font Stack**
The Sindhi font classes use this font stack:
```css
font-family: 'MB Lateefi SK 2.0', 'Lateef', 'Noto Naskh Arabic', serif;
```

### **Font Features**
```css
font-feature-settings: 'kern' 1, 'liga' 1;
text-rendering: optimizeLegibility;
```

### **RTL Support**
```css
direction: rtl;
text-align: right;
unicode-bidi: bidi-override;
```

## 📱 **Responsive Behavior**

The Sindhi text classes automatically adjust for mobile devices:
- `sindhi-text-2xl` becomes `1.25rem` on mobile
- `sindhi-text-xl` becomes `1.125rem` on mobile  
- `sindhi-text-lg` becomes `1rem` on mobile

## 🎯 **Best Practices**

1. **Always use RTL for Sindhi text**: Add `sindhi-rtl` class for proper text direction
2. **Combine with existing classes**: Use Sindhi classes alongside your existing Tailwind classes
3. **Maintain hierarchy**: Use appropriate size classes for different text levels
4. **Test on different devices**: Ensure readability across all screen sizes
5. **Use semantic classes**: Choose classes that match the content purpose

## 🚀 **Quick Start**

To add Sindhi text to any admin component:

1. **Import the admin CSS** (if not already imported)
2. **Add the appropriate Sindhi class** to your element
3. **Include RTL support** with `sindhi-rtl` for proper text direction
4. **Combine with existing styling** for consistent appearance

Example:
```tsx
<div className="bg-white border-[#E5E5E5] rounded-lg p-6">
  <h3 className="sindhi-heading sindhi-text-xl text-[#1F1F1F] mb-4">
    سنڌي عنوان
  </h3>
  <p className="sindhi-body text-[#6B6B6B]">
    سنڌي متن جي تفصيل
  </p>
</div>
```

This will give you beautiful, properly rendered Sindhi text that integrates seamlessly with your admin panel design system!
