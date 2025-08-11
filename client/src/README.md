# Source Directory

The main source code directory containing all React application components, pages, utilities, and styling.

## 📁 Directory Overview

```
src/
├── components/     # Reusable UI components and custom components
├── pages/         # Route-level page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── App.tsx        # Root application component with routing
├── main.tsx       # Application entry point and providers
└── index.css      # Global styles, CSS variables, and Tailwind directives
```

## 🏗 Architecture Patterns

### Component Organization
- **Pages**: Route-level components that represent full screens
- **Components**: Reusable UI components and business logic components
- **Hooks**: Custom React hooks for shared logic
- **Lib**: Utility functions, constants, and configurations

### Import Strategy
- Absolute imports using `@/` alias
- Barrel exports for cleaner imports
- Consistent import ordering
- Type-only imports where appropriate

## 🎨 Styling Architecture

### Global Styles (`index.css`)
```css
/* Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS custom properties for theming */
:root {
  --uct-blue: #003366;
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
}

/* Component-specific styles */
```

### Styling Approach
- Tailwind utility classes for most styling
- CSS custom properties for theme values
- shadcn/ui component styling
- Responsive design utilities

## 🔧 Key Files

### `App.tsx`
- Route definitions using wouter
- Layout structure
- Authentication guards
- Global providers

### `main.tsx`
- React 18 root rendering
- Query client setup
- Global error boundaries
- Development tools integration

### `index.css`
- Tailwind CSS imports
- CSS custom properties
- Global component styles
- Typography scales

## 📱 Responsive Design

### Breakpoint Strategy
```css
/* Mobile first approach */
.container {
  @apply px-4;        /* mobile */
  @apply sm:px-6;     /* tablet */
  @apply lg:px-8;     /* desktop */
}
```

### Mobile Optimization
- Touch-friendly interfaces
- Optimized image loading
- Progressive enhancement
- Performance-first approach

## 🚀 Development Workflow

### Component Development
1. Create component in appropriate directory
2. Implement with TypeScript
3. Style with Tailwind CSS
4. Add proper prop types
5. Export from barrel file

### State Management
- Local component state with `useState`
- Server state with TanStack Query
- Form state with React Hook Form
- Global state with Context API

## 🧪 Testing Strategy

### Component Testing
- React Testing Library setup
- User-centric test approach
- Accessibility testing
- Integration test patterns

### Mock Strategy
- MSW for API mocking
- Test data factories
- Component mocking
- Service mocking

## 📦 Bundle Optimization

### Code Splitting
- Route-based splitting
- Dynamic imports
- Lazy loading patterns
- Bundle analysis

### Performance Monitoring
- Web Vitals tracking
- Bundle size monitoring
- Performance profiling
- Optimization opportunities

## 🔒 Security Considerations

- XSS prevention through proper escaping
- Content Security Policy compliance
- Secure API communication
- Input validation and sanitization