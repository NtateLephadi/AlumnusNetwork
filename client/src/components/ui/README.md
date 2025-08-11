# UI Components Library

This directory contains the shadcn/ui component library - a collection of reusable, accessible, and customizable React components built on top of Radix UI primitives.

## 🎯 Overview

shadcn/ui provides:
- **Accessibility**: Built on Radix UI primitives with full ARIA support
- **Customization**: Styled with Tailwind CSS and CSS variables
- **Type Safety**: Full TypeScript support with proper typing
- **Consistency**: Unified design system across the application

## 📦 Component Categories

### Form & Input Components
- **Button**: Various button styles (primary, secondary, destructive, ghost, link)
- **Input**: Text input with validation states
- **Textarea**: Multi-line text input
- **Label**: Accessible form labels
- **Form**: Form wrapper with validation context
- **Checkbox**: Checkbox input with custom styling
- **Radio Group**: Radio button groups
- **Select**: Dropdown selection with search
- **Switch**: Toggle switch component
- **Slider**: Range slider input

### Layout & Structure
- **Card**: Content containers with header, content, and footer
- **Sheet**: Slide-over panel for mobile navigation
- **Sidebar**: Application sidebar component
- **Separator**: Visual dividers between sections
- **Aspect Ratio**: Maintain consistent image/video ratios
- **Resizable**: Draggable panels for flexible layouts

### Navigation & Menu
- **Navigation Menu**: Main navigation with dropdowns
- **Breadcrumb**: Hierarchical navigation
- **Menubar**: Menu bar with keyboard navigation
- **Context Menu**: Right-click context menus
- **Dropdown Menu**: Dropdown menus with nested items
- **Command**: Command palette with search

### Feedback & Display
- **Alert**: Status messages and notifications
- **Alert Dialog**: Modal confirmation dialogs
- **Dialog**: Modal dialogs for forms and content
- **Drawer**: Mobile-friendly bottom drawer
- **Toast**: Temporary notification messages
- **Toaster**: Toast notification system
- **Progress**: Progress indicators and loading states
- **Skeleton**: Loading placeholder components
- **Badge**: Status badges and labels

### Data Display
- **Table**: Data tables with sorting and pagination
- **Chart**: Data visualization components
- **Calendar**: Date picker and calendar views
- **Carousel**: Image and content carousels
- **Accordion**: Collapsible content sections
- **Collapsible**: Simple show/hide content
- **Tabs**: Tabbed content organization

### Overlay & Popover
- **Popover**: Floating content panels
- **Hover Card**: Content on hover interactions
- **Tooltip**: Contextual help text
- **Toggle**: Toggle button states
- **Toggle Group**: Multiple toggle selection

### Utility Components
- **Avatar**: User profile images with fallbacks
- **Scroll Area**: Custom scrollable areas
- **Input OTP**: One-time password input

## 🎨 Styling System

### CSS Variables
Components use CSS custom properties for theming:
```css
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
  --primary: hsl(221.2 83.2% 53.3%);
  --primary-foreground: hsl(210 40% 98%);
  /* ... more variables */
}
```

### Tailwind Integration
- Utility classes for spacing, colors, and layout
- Responsive design utilities
- Dark mode support (future)
- Animation utilities

### Component Variants
Using `class-variance-authority` for consistent variants:
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        // ...
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        // ...
      }
    }
  }
);
```

## 🔧 Usage Examples

### Basic Button
```typescript
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Click me
</Button>
```

### Form with Validation
```typescript
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function MyForm() {
  const form = useForm();
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Dialog Modal
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content goes here.</p>
  </DialogContent>
</Dialog>
```

## ⚡ Performance Optimizations

### Bundle Size
- Tree-shakable exports
- Minimal dependencies
- Optimized component rendering
- Lazy loading for heavy components

### Accessibility
- ARIA attributes by default
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## 🛠 Customization

### Extending Components
```typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export function CustomButton({ className, isLoading, ...props }: CustomButtonProps) {
  return (
    <Button
      className={cn("relative", isLoading && "pointer-events-none opacity-50", className)}
      {...props}
    />
  );
}
```

### Theme Customization
Modify CSS variables in `index.css`:
```css
:root {
  --primary: hsl(210 100% 50%); /* Custom primary color */
}
```

## 📋 Configuration

Components are configured in `components.json`:
```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## 🧪 Testing

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
});
```

### Accessibility Testing
- Automated accessibility tests
- Keyboard navigation testing
- Screen reader testing
- Color contrast validation