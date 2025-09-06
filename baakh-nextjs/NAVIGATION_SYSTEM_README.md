# Navigation System Documentation

## Overview

The Baakh Navigation System provides a comprehensive, accessible, and responsive navigation solution for the poetry platform. It includes primary navigation with submenus, secondary actions, mobile support, and various utility components.

## Components

### 1. MainNavigation

The primary navigation component that includes:
- **Primary Navigation**: Home, Couplets, Poets, Themes, Timeline, Collections
- **Submenus**: Dropdown menus with descriptions for complex navigation items
- **Secondary Actions**: Search, Language switching, Theme toggle, Donate, Sign In
- **Mobile Support**: Hamburger menu with accordion submenus
- **Accessibility**: ARIA labels, keyboard navigation, focus management

#### Usage

```tsx
import { MainNavigation } from '@/components/navigation';

export default function Layout({ children }) {
  return (
    <>
      <MainNavigation />
      <main>{children}</main>
    </>
  );
}
```

#### Features

- **Sticky Header**: Stays at top with backdrop blur effect
- **Active States**: Visual indicators for current page
- **Responsive Design**: Adapts to different screen sizes
- **Dark Mode Support**: Integrated with theme system
- **Search Integration**: Opens global search overlay

### 2. SearchOverlay

A modal search interface with:
- **Global Search**: Search across all content types
- **Type Filters**: Filter by Couplets, Poets, or Topics
- **Recent Searches**: Quick access to previous searches
- **Trending Searches**: Popular search terms
- **Results Display**: Rich result cards with metadata

#### Usage

```tsx
import { SearchOverlay } from '@/components/navigation';

function MyComponent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsSearchOpen(true)}>
        Open Search
      </button>
      
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
```

#### Features

- **Modal Interface**: Full-screen overlay with backdrop
- **Keyboard Support**: Escape key to close, Enter to search
- **Focus Management**: Auto-focus on search input
- **Search History**: Remembers recent searches
- **Rich Results**: Displays content with tags and descriptions

### 3. BreadcrumbNavigation

Shows page hierarchy and provides easy navigation:
- **Auto-generated**: Creates breadcrumbs from current URL
- **Home Icon**: Visual home indicator
- **Clickable Links**: Navigate to parent pages
- **Locale Aware**: Handles language-specific routes

#### Usage

```tsx
import { BreadcrumbNavigation } from '@/components/navigation';

export default function Page() {
  return (
    <>
      <BreadcrumbNavigation />
      <main>Page content...</main>
    </>
  );
}
```

#### Features

- **URL Parsing**: Automatically generates from route
- **Locale Handling**: Skips language segments
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: Proper ARIA labels and semantic markup

### 4. PageNavigation

Content pagination and control component:
- **Pagination**: Page numbers with smart ellipsis
- **View Modes**: Toggle between grid and list views
- **Sorting**: Dropdown for different sort options
- **Filtering**: Content type and category filters
- **Items Per Page**: Configurable page sizes

#### Usage

```tsx
import { PageNavigation } from '@/components/navigation';

function ContentList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  return (
    <PageNavigation
      currentPage={currentPage}
      totalPages={10}
      totalItems={200}
      itemsPerPage={20}
      onPageChange={setCurrentPage}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      sortOptions={[
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" }
      ]}
      currentSort="newest"
      onSortChange={(sort) => console.log('Sort:', sort)}
    />
  );
}
```

#### Features

- **Smart Pagination**: Shows relevant page numbers
- **View Controls**: Grid/List toggle with icons
- **Sort Options**: Configurable sorting dropdowns
- **Filter Controls**: Category and type filtering
- **Responsive Layout**: Adapts to mobile and desktop

### 5. NavigationProvider

A wrapper component that provides consistent navigation:
- **Layout Wrapper**: Includes navigation and main content area
- **Spacing**: Automatically adds top padding for fixed header
- **Consistency**: Ensures uniform navigation across pages

#### Usage

```tsx
import { NavigationProvider } from '@/components/navigation';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NavigationProvider>
          {children}
        </NavigationProvider>
      </body>
    </html>
  );
}
```

## Navigation Structure

### Primary Navigation Items

1. **Home** (`/`)
   - Returns to homepage

2. **Couplets** (with submenu)
   - Featured (`/couplets/featured`)
   - Newest (`/couplets/new`)
   - Random (`/couplets/random`)

3. **Poets** (with submenu)
   - All Poets (`/poets`)
   - By Era (`/poets?era=classical`)
   - Notable (`/poets?filter=notable`)

4. **Themes** (with submenu)
   - Trending (`/topics/trending`)
   - All Topics (`/topics`)

5. **Timeline** (`/timeline`)
   - Eras view (Classical, Modern, Contemporary)

6. **Collections** (with submenu)
   - Editor's Picks (`/collections/editors-picks`)
   - Scholarly Collections (`/collections/scholarly`)

### Secondary Actions

- **Search**: Global search overlay
- **Language**: Sindhi/English switching
- **Theme**: Light/Dark mode toggle
- **Donate**: Support page link
- **Sign In**: Authentication/profile access

## Mobile Behavior

### Desktop Navigation
- Horizontal menu with hover/focus submenus
- Click to open submenus on touch devices
- Sticky header with subtle border on scroll

### Mobile Navigation
- Hamburger menu button
- Full-screen drawer overlay
- Accordion submenus for complex navigation
- Persistent search button
- Bottom-positioned Donate and Sign In buttons

## Accessibility Features

### ARIA Support
- `aria-label="Main"` for primary navigation
- `aria-expanded` for submenu states
- `aria-haspopup="true"` for dropdown items
- `role="menu"` and `role="menuitem"` for submenus

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter/Space to activate buttons and links
- Escape key to close submenus and search
- Arrow keys for submenu navigation

### Focus Management
- Visible focus indicators
- Focus trapped in mobile drawer
- Auto-focus on search input
- Focus restoration when closing modals

## Implementation Guidelines

### 1. Basic Setup

```tsx
// In your root layout or main component
import { NavigationProvider } from '@/components/navigation';

export default function Layout({ children }) {
  return (
    <NavigationProvider>
      {children}
    </NavigationProvider>
  );
}
```

### 2. Custom Navigation

```tsx
// For custom navigation needs
import { MainNavigation } from '@/components/navigation';

export default function CustomLayout({ children }) {
  return (
    <>
      <MainNavigation />
      <div className="custom-layout">
        {children}
      </div>
    </>
  );
}
```

### 3. Adding Breadcrumbs

```tsx
// On content pages
import { BreadcrumbNavigation } from '@/components/navigation';

export default function ContentPage() {
  return (
    <>
      <BreadcrumbNavigation />
      <div className="content">
        {/* Page content */}
      </div>
    </>
  );
}
```

### 4. Page Navigation

```tsx
// For list/grid pages
import { PageNavigation } from '@/components/navigation';

function ContentList() {
  // State management for pagination, sorting, etc.
  
  return (
    <div>
      {/* Content items */}
      <PageNavigation
        // ... props
      />
    </div>
  );
}
```

## Styling and Theming

### CSS Classes
- Uses Tailwind CSS for styling
- Dark mode support with `dark:` variants
- Responsive breakpoints: `sm:`, `md:`, `lg:`
- Consistent spacing and typography

### Customization
- Theme colors via CSS variables
- Component variants for different styles
- Responsive behavior customization
- Animation and transition options

## Performance Considerations

### Optimization
- Lazy loading of submenus
- Efficient state management
- Minimal re-renders
- Optimized event handlers

### Best Practices
- Use `useCallback` for event handlers
- Implement proper cleanup in `useEffect`
- Avoid unnecessary re-renders
- Optimize for mobile performance

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Features**: CSS Grid, Flexbox, CSS Variables
- **Fallbacks**: Graceful degradation for older browsers

## Troubleshooting

### Common Issues

1. **Submenus not opening**
   - Check click event handlers
   - Verify state management
   - Ensure proper refs are set

2. **Mobile menu not working**
   - Check z-index values
   - Verify overlay positioning
   - Ensure proper event handling

3. **Search not focusing**
   - Check input ref assignment
   - Verify useEffect dependencies
   - Ensure proper timing

### Debug Mode

Enable debug logging by setting environment variable:
```bash
NEXT_PUBLIC_DEBUG_NAVIGATION=true
```

## Future Enhancements

### Planned Features
- **Search Suggestions**: AI-powered search recommendations
- **Navigation Analytics**: Track user navigation patterns
- **Customizable Menus**: User-configurable navigation
- **Advanced Filters**: Multi-select and range filters
- **Keyboard Shortcuts**: Power user navigation shortcuts

### Extension Points
- **Plugin System**: Third-party navigation extensions
- **Custom Themes**: User-defined navigation styles
- **Integration APIs**: Connect with external systems
- **Analytics Hooks**: Custom tracking and metrics

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Navigate to `/navigation-demo` to test components

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component testing with Jest/React Testing Library

### Testing
- Unit tests for utility functions
- Component tests for UI behavior
- Integration tests for navigation flow
- Accessibility testing with axe-core

## Support

For questions or issues:
- Check the demo page: `/navigation-demo`
- Review component documentation
- Check browser console for errors
- Verify component props and state

---

*This navigation system is designed to provide an intuitive, accessible, and performant user experience across all devices and platforms.*
