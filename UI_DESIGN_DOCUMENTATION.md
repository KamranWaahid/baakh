# Baakh Poetry Platform - UI Design Documentation

## Table of Contents
1. [Overview](#overview)
2. [Design System](#design-system)
3. [Navigation System](#navigation-system)
4. [Page Structure](#page-structure)
5. [Component Library](#component-library)
6. [Responsive Design](#responsive-design)
7. [Accessibility & RTL Support](#accessibility--rtl-support)
8. [Mobile App Development Guide](#mobile-app-development-guide)
9. [Color Palette](#color-palette)
10. [Typography](#typography)
11. [Spacing & Layout](#spacing--layout)
12. [Interactive Elements](#interactive-elements)

## Overview

Baakh is a modern poetry platform dedicated to preserving and showcasing Sindhi poetry heritage. The platform features a bilingual interface (Sindhi/English) with RTL support, modern design principles, and comprehensive content management.

### Key Features
- **Bilingual Support**: Full Sindhi (RTL) and English (LTR) language support
- **Modern Design**: Clean, minimal interface with focus on content
- **Responsive**: Mobile-first design approach
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Dark Mode**: Complete dark theme support
- **Search**: Advanced search with filters and suggestions
- **Content Types**: Poets, Poetry, Couplets, Categories, Topics, Timeline

## Design System

### Core Principles
1. **Content First**: Design emphasizes poetry content readability
2. **Cultural Sensitivity**: Respects Sindhi typography and RTL layout
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Performance**: Optimized for fast loading and smooth interactions
5. **Consistency**: Unified design language across all components

### Design Tokens

#### Colors
```css
/* Primary Colors */
--primary: 220 14.3% 95.9%;           /* Light blue-gray */
--primary-foreground: 220.9 39.3% 11%; /* Dark blue-gray */

/* Secondary Colors */
--secondary: 220 14.3% 95.9%;         /* Light background */
--secondary-foreground: 220.9 39.3% 11%;

/* Accent Colors */
--accent: 220 14.3% 95.9%;
--accent-foreground: 220.9 39.3% 11%;

/* Background Colors */
--background: 0 0% 100%;               /* White */
--foreground: 220.9 39.3% 11%;         /* Dark text */

/* Muted Colors */
--muted: 220 14.3% 95.9%;
--muted-foreground: 220 4.8% 46.1%;

/* Border Colors */
--border: 220 13% 91%;
--input: 220 13% 91%;

/* Status Colors */
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;
```

#### Typography
```css
/* Font Families */
--font-inter: 'Inter', sans-serif;
--font-sindhi: 'Noto Sans Arabic', 'Arial Unicode MS', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## Navigation System

### Main Navigation Structure

#### Desktop Navigation
```
[Logo] [Poets] [Poetry] [Couplets] [Categories] [Topics] [Timeline] [Language] [Theme] [User]
```

#### Mobile Navigation
```
[☰ Menu] [Logo] [Search] [User]
```

### Navigation Components

#### 1. MainNavigation Component
- **Location**: `/src/components/ui/MainNavigation.tsx`
- **Features**:
  - Sticky header with backdrop blur
  - Active state indicators
  - Language switcher
  - Theme toggle
  - User authentication state
  - Mobile hamburger menu

#### 2. Search Overlay
- **Location**: `/src/components/ui/SearchOverlay.tsx`
- **Features**:
  - Global search functionality
  - Filter by content type (Poets, Poetry, Couplets)
  - Recent searches
  - Trending searches
  - Keyboard navigation

#### 3. Footer Navigation
- **Location**: `/src/components/ui/Footer.tsx`
- **Features**:
  - Quick links
  - Poetry categories
  - Social links
  - Copyright information
  - Bilingual content

## Page Structure

### 1. Homepage (`/`)

#### Hero Section
- **Background**: Gradient with poetry-themed imagery
- **Content**: 
  - Main tagline in both languages
  - Search interface
  - Quick access buttons
  - Anniversary badge (if applicable)

#### Featured Content Sections
1. **Featured Couplets**
   - Card-based layout
   - Poet information
   - Like/bookmark actions
   - Pagination

2. **Featured Poets**
   - Avatar grid layout
   - Poet names and taglines
   - Quick stats (poems count, followers)

3. **Categories Section**
   - Grid of category cards
   - Icons and descriptions
   - Content counts

4. **Timeline Section**
   - Historical periods
   - Poet counts per period
   - Visual timeline

5. **Tags Section**
   - Popular tags cloud
   - Color-coded categories
   - Click-to-filter functionality

#### Layout Structure
```html
<header>
  <MainNavigation />
</header>
<main>
  <section class="hero">...</section>
  <section class="featured-couplets">...</section>
  <section class="featured-poets">...</section>
  <section class="categories">...</section>
  <section class="timeline">...</section>
  <section class="tags">...</section>
</main>
<footer>
  <Footer />
</footer>
```

### 2. Poets Page (`/poets`)

#### Page Header
- **Title**: "Poets" / "شاعر"
- **Search Bar**: Filter poets by name
- **Sort Options**: Name, Era, Popularity
- **View Toggle**: Grid/List view

#### Poets Grid/List
- **Card Layout**:
  - Poet avatar
  - Name and laqab (title)
  - Tagline
  - Birth/death dates
  - Poetry count
  - Location
  - Tags

#### Pagination
- **Page Numbers**: Smart pagination
- **Items Per Page**: 20, 40, 60 options
- **Total Count**: "Showing X of Y poets"

### 3. Poetry Page (`/poetry`)

#### Page Header
- **Title**: "Poetry" / "شاعري"
- **Search & Filters**: Title, poet, category
- **Sort Options**: Date, Title, Popularity

#### Poetry Cards
- **Layout**:
  - Poetry title
  - Poet name and avatar
  - Category badge
  - Excerpt/preview
  - Stats (views, likes, bookmarks)
  - Tags

### 4. Couplets Page (`/couplets`)

#### Page Header
- **Title**: "Couplets" / "شعر"
- **Search**: Full-text search
- **Filters**: Poet, tags, date range

#### Couplet Cards
- **Layout**:
  - Couplet text (Sindhi/English)
  - Poet information
  - Tags
  - Interaction buttons (like, bookmark, share)
  - Timestamp

### 5. Categories Page (`/categories`)

#### Page Header
- **Title**: "Categories" / "صنفون"
- **Search**: Filter categories
- **Sort**: Name, count, date

#### Category Grid
- **Card Layout**:
  - Category icon
  - Name (bilingual)
  - Description
  - Poetry count
  - Color coding

### 6. Timeline Page (`/timeline`)

#### Page Header
- **Title**: "Timeline" / "دور"
- **Description**: Historical periods overview

#### Timeline Visualization
- **Period Cards**:
  - Era name and years
  - Description
  - Poet count
  - Notable poets
  - Color coding by period

### 7. About Page (`/about`)

#### Sections
1. **Hero**: Mission statement
2. **Mission**: Platform goals
3. **Features**: Key capabilities
4. **Team**: Contributors
5. **Contact**: Contact information

## Component Library

### 1. Button Component

#### Variants
```tsx
// Primary Button
<Button variant="default">Primary Action</Button>

// Secondary Button
<Button variant="secondary">Secondary Action</Button>

// Outline Button
<Button variant="outline">Outline Action</Button>

// Ghost Button
<Button variant="ghost">Ghost Action</Button>

// Link Button
<Button variant="link">Link Action</Button>

// Destructive Button
<Button variant="destructive">Delete</Button>
```

#### Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

### 2. Card Component

#### Basic Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

#### Card Variants
- **Default**: Standard card with border and shadow
- **Featured**: Highlighted card with accent border
- **Interactive**: Hover effects and click handlers

### 3. Input Component

#### Text Input
```tsx
<Input 
  type="text" 
  placeholder="Enter text..." 
  className="w-full"
/>
```

#### Search Input
```tsx
<Input 
  type="search" 
  placeholder="Search..." 
  className="w-full"
  icon={<Search className="h-4 w-4" />}
/>
```

### 4. Badge Component

#### Badge Variants
```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### 5. Avatar Component

#### Basic Avatar
```tsx
<Avatar>
  <AvatarImage src="/path/to/image.jpg" alt="User" />
  <AvatarFallback>U</AvatarFallback>
</Avatar>
```

### 6. Search Interface

#### Global Search
- **Location**: `/src/components/ui/SearchInterface.tsx`
- **Features**:
  - Real-time search suggestions
  - Content type filtering
  - Recent searches
  - Keyboard shortcuts

### 7. Language Switcher

#### Component
- **Location**: `/src/components/ui/LanguageSwitcher.tsx`
- **Features**:
  - Toggle between Sindhi/English
  - RTL/LTR layout switching
  - URL routing updates

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Mobile Layout

#### Navigation
- **Hamburger Menu**: Collapsible navigation
- **Touch Targets**: Minimum 44px touch targets
- **Swipe Gestures**: Support for swipe navigation

#### Content Layout
- **Single Column**: Stacked layout on mobile
- **Card Grid**: Responsive grid (1-2-3 columns)
- **Typography**: Adjusted font sizes for mobile
- **Spacing**: Reduced padding and margins

#### Mobile-Specific Components
1. **Bottom Navigation**: Quick access to main sections
2. **Pull-to-Refresh**: Refresh content on mobile
3. **Infinite Scroll**: Load more content on scroll
4. **Touch Interactions**: Swipe, pinch, tap gestures

### Tablet Layout
- **Two Column**: Sidebar + main content
- **Grid Layout**: 2-3 columns for cards
- **Larger Touch Targets**: Optimized for touch

### Desktop Layout
- **Multi Column**: Full navigation + content
- **Hover States**: Rich hover interactions
- **Keyboard Navigation**: Full keyboard support

## Accessibility & RTL Support

### Accessibility Features

#### ARIA Labels
```tsx
<button aria-label="Close menu">
  <X className="h-4 w-4" />
</button>
```

#### Keyboard Navigation
- **Tab Order**: Logical tab sequence
- **Focus Indicators**: Visible focus states
- **Keyboard Shortcuts**: Common shortcuts (Ctrl+K for search)

#### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: Descriptive image alt text
- **Live Regions**: Dynamic content announcements

### RTL Support

#### Layout Direction
```css
/* RTL Layout */
[dir="rtl"] {
  text-align: right;
}

/* LTR Layout */
[dir="ltr"] {
  text-align: left;
}
```

#### Sindhi Typography
- **Font Stack**: Noto Sans Arabic, Arial Unicode MS
- **Line Height**: Increased for better readability
- **Character Spacing**: Optimized for Sindhi script

#### RTL Components
- **Navigation**: Mirrored layout
- **Cards**: Right-aligned content
- **Forms**: RTL input direction
- **Icons**: Flipped for RTL context

## Mobile App Development Guide

### Design System Implementation

#### 1. Color Palette
```swift
// iOS Swift
struct BaakhColors {
    static let primary = Color(red: 0.95, green: 0.96, blue: 0.98)
    static let primaryForeground = Color(red: 0.11, green: 0.11, blue: 0.11)
    static let secondary = Color(red: 0.95, green: 0.96, blue: 0.98)
    static let background = Color.white
    static let foreground = Color(red: 0.11, green: 0.11, blue: 0.11)
    static let muted = Color(red: 0.46, green: 0.46, blue: 0.46)
    static let border = Color(red: 0.91, green: 0.91, blue: 0.91)
}
```

```kotlin
// Android Kotlin
object BaakhColors {
    val primary = Color(0xFFF5F6FA)
    val primaryForeground = Color(0xFF1C1C1C)
    val secondary = Color(0xFFF5F6FA)
    val background = Color.White
    val foreground = Color(0xFF1C1C1C)
    val muted = Color(0xFF757575)
    val border = Color(0xFFE8E8E8)
}
```

#### 2. Typography
```swift
// iOS Swift
struct BaakhFonts {
    static let inter = Font.custom("Inter", size: 16)
    static let sindhi = Font.custom("Noto Sans Arabic", size: 16)
    
    static let title = Font.custom("Inter-Bold", size: 24)
    static let subtitle = Font.custom("Inter-Medium", size: 18)
    static let body = Font.custom("Inter-Regular", size: 16)
    static let caption = Font.custom("Inter-Regular", size: 14)
}
```

#### 3. Spacing System
```swift
// iOS Swift
struct BaakhSpacing {
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
    static let xxl: CGFloat = 48
}
```

### Component Implementation

#### 1. Button Component
```swift
// iOS Swift
struct BaakhButton: View {
    let title: String
    let variant: ButtonVariant
    let size: ButtonSize
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(size.font)
                .foregroundColor(variant.foregroundColor)
                .padding(.horizontal, size.horizontalPadding)
                .padding(.vertical, size.verticalPadding)
                .background(variant.backgroundColor)
                .cornerRadius(8)
        }
    }
}
```

#### 2. Card Component
```swift
// iOS Swift
struct BaakhCard<Content: View>: View {
    let content: Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            content
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}
```

#### 3. Navigation Structure
```swift
// iOS Swift - TabView
TabView {
    HomeView()
        .tabItem {
            Image(systemName: "house")
            Text("Home")
        }
    
    PoetsView()
        .tabItem {
            Image(systemName: "person.2")
            Text("Poets")
        }
    
    PoetryView()
        .tabItem {
            Image(systemName: "book")
            Text("Poetry")
        }
    
    CoupletsView()
        .tabItem {
            Image(systemName: "quote.bubble")
            Text("Couplets")
        }
    
    CategoriesView()
        .tabItem {
            Image(systemName: "folder")
            Text("Categories")
        }
}
```

### RTL Support Implementation

#### 1. Layout Direction
```swift
// iOS Swift
struct RTLView<Content: View>: View {
    let content: Content
    let isRTL: Bool
    
    var body: some View {
        content
            .environment(\.layoutDirection, isRTL ? .rightToLeft : .leftToRight)
    }
}
```

#### 2. Sindhi Text Handling
```swift
// iOS Swift
struct SindhiText: View {
    let text: String
    
    var body: some View {
        Text(text)
            .font(.custom("Noto Sans Arabic", size: 16))
            .multilineTextAlignment(.trailing)
            .environment(\.layoutDirection, .rightToLeft)
    }
}
```

### API Integration

#### 1. Base API Client
```swift
// iOS Swift
class BaakhAPIClient: ObservableObject {
    private let baseURL = "https://baakh.com/api"
    
    func fetchPoets() async throws -> [Poet] {
        // Implementation
    }
    
    func fetchPoetry() async throws -> [Poetry] {
        // Implementation
    }
    
    func fetchCouplets() async throws -> [Couplet] {
        // Implementation
    }
}
```

#### 2. Data Models
```swift
// iOS Swift
struct Poet: Codable, Identifiable {
    let id: String
    let poetSlug: String
    let englishName: String
    let englishLaqab: String?
    let sindhiName: String?
    let sindhiLaqab: String?
    let birthDate: String?
    let deathDate: String?
    let birthPlace: String?
    let fileUrl: String?
    let isFeatured: Bool?
    let tags: [String]?
}
```

### Performance Considerations

#### 1. Image Loading
- **Lazy Loading**: Load images as they come into view
- **Caching**: Cache images locally
- **Compression**: Optimize image sizes

#### 2. Data Management
- **Pagination**: Implement infinite scroll
- **Caching**: Cache API responses
- **Offline Support**: Store essential data locally

#### 3. Memory Management
- **Image Cleanup**: Dispose of unused images
- **Data Cleanup**: Clear old data from memory
- **Background Tasks**: Handle background app states

## Color Palette

### Primary Colors
- **Primary**: #F5F6FA (Light blue-gray)
- **Primary Foreground**: #1C1C1C (Dark blue-gray)
- **Secondary**: #F5F6FA (Light background)
- **Accent**: #3B82F6 (Blue accent)

### Semantic Colors
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Info**: #3B82F6 (Blue)

### Neutral Colors
- **Background**: #FFFFFF (White)
- **Foreground**: #1C1C1C (Dark text)
- **Muted**: #757575 (Gray)
- **Border**: #E8E8E8 (Light gray)

### Dark Mode Colors
- **Background**: #0F0F0F (Dark)
- **Foreground**: #FAFAFA (Light text)
- **Muted**: #A3A3A3 (Light gray)
- **Border**: #262626 (Dark border)

## Typography

### Font Families
1. **Inter**: Primary font for English text
2. **Noto Sans Arabic**: Primary font for Sindhi text
3. **Arial Unicode MS**: Fallback for Sindhi

### Font Hierarchy
```css
/* Headings */
h1: 2.25rem (36px) - Inter Bold
h2: 1.875rem (30px) - Inter Semibold
h3: 1.5rem (24px) - Inter Medium
h4: 1.25rem (20px) - Inter Medium

/* Body Text */
body: 1rem (16px) - Inter Regular
small: 0.875rem (14px) - Inter Regular
caption: 0.75rem (12px) - Inter Regular

/* Sindhi Text */
sindhi: 1rem (16px) - Noto Sans Arabic Regular
sindhi-title: 1.5rem (24px) - Noto Sans Arabic Bold
```

## Spacing & Layout

### Spacing Scale
```css
/* Spacing Units */
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
3xl: 4rem (64px)
```

### Grid System
```css
/* Container Widths */
container-sm: 640px
container-md: 768px
container-lg: 1024px
container-xl: 1280px
container-2xl: 1536px

/* Grid Columns */
grid-cols-1: 1 column
grid-cols-2: 2 columns
grid-cols-3: 3 columns
grid-cols-4: 4 columns
grid-cols-6: 6 columns
grid-cols-12: 12 columns
```

## Interactive Elements

### Hover States
- **Buttons**: Slight color change and scale
- **Cards**: Subtle shadow increase
- **Links**: Underline or color change

### Focus States
- **Visible Focus**: Clear focus indicators
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels

### Loading States
- **Skeleton Screens**: Placeholder content
- **Spinners**: Loading indicators
- **Progressive Loading**: Load content as available

### Animation
- **Framer Motion**: Smooth transitions
- **Micro-interactions**: Subtle feedback
- **Page Transitions**: Smooth navigation

---

## Implementation Notes

### For Web Developers
1. Use the provided component library
2. Follow the design system tokens
3. Implement proper RTL support
4. Ensure accessibility compliance
5. Test on multiple devices and browsers

### For Mobile Developers
1. Implement the color palette and typography
2. Use the component specifications
3. Handle RTL layout properly
4. Implement proper navigation structure
5. Follow platform-specific guidelines

### For Designers
1. Use the established color palette
2. Follow the typography hierarchy
3. Maintain consistent spacing
4. Consider both LTR and RTL layouts
5. Ensure accessibility in designs

This documentation provides a comprehensive guide for developing mobile applications based on the Baakh poetry platform's UI design system. The design emphasizes cultural sensitivity, accessibility, and modern user experience principles while maintaining the platform's focus on poetry content.



