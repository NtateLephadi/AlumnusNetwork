# Components Directory

Reusable UI components and business logic components for the UCT SCF Alumni Hub application.

## 🏗 Structure

```
components/
├── ui/                    # shadcn/ui components (auto-generated)
├── create-event-modal.tsx # Event creation modal
├── create-post-modal.tsx  # Social post creation modal
├── donation-modal.tsx     # Donation processing modal
├── edit-event-modal.tsx   # Event editing modal
├── event-card.tsx         # Event display card
├── mobile-nav.tsx         # Mobile navigation component
├── navigation.tsx         # Main navigation bar
├── notifications.tsx      # Notification system
├── post-card.tsx          # Social post display card
└── sidebar.tsx            # Application sidebar
```

## 🎯 Component Categories

### Business Logic Components

#### Event Management
- **EventCard**: Display event information with RSVP and donation functionality
- **CreateEventModal**: Form for creating new community events
- **EditEventModal**: Form for modifying existing events

#### Social Features
- **PostCard**: Display social posts with engagement options
- **CreatePostModal**: Interface for creating community posts

#### Financial
- **DonationModal**: Complete donation flow with banking integration

#### Notifications
- **Notifications**: Real-time notification system with mark-as-read functionality

### Navigation Components

#### **Navigation**: Main application navigation
- Desktop navigation bar
- User profile dropdown
- Admin access controls
- Mobile-responsive design

#### **MobileNav**: Mobile-specific navigation
- Hamburger menu
- Touch-friendly interactions
- Collapsible sections

#### **Sidebar**: Application sidebar
- Quick navigation links
- Banking information display
- Community stats
- Context-sensitive content

## 🎨 UI Components (`ui/`)

### shadcn/ui Library
Auto-generated components providing:
- Consistent design system
- Accessibility features
- TypeScript support
- Customizable styling

#### Key Components
- **Button**: Various button styles and sizes
- **Card**: Content containers with shadows
- **Dialog/Modal**: Overlay components
- **Form**: Form controls and validation
- **Input/Textarea**: Text input components
- **Select**: Dropdown selection
- **Toast**: Notification messages

## 🔧 Development Patterns

### Component Structure
```typescript
interface ComponentProps {
  // Prop definitions with TypeScript
}

export function ComponentName({ props }: ComponentProps) {
  // State management
  // Event handlers
  // Effects
  
  return (
    // JSX with Tailwind styling
  );
}
```

### Styling Approach
- Tailwind CSS utility classes
- shadcn/ui component variants
- Responsive design utilities
- Dark mode support (future)

### State Management
- Local state with `useState`
- Form state with `react-hook-form`
- Server state with TanStack Query
- Props drilling for simple cases

## 🚀 Best Practices

### Reusability
- Generic component interfaces
- Configurable styling props
- Flexible content slots
- Composable design patterns

### Performance
- Memoization for expensive operations
- Lazy loading for heavy components
- Optimized re-rendering
- Efficient event handling

### Accessibility
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management

## 📱 Mobile Considerations

### Touch Interactions
- Tap target sizes (44px minimum)
- Touch-friendly spacing
- Swipe gestures where appropriate
- Haptic feedback simulation

### Responsive Design
- Mobile-first approach
- Flexible layouts
- Readable typography
- Optimized images

## 🧪 Testing

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

test('renders component correctly', () => {
  render(<ComponentName />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### Testing Strategy
- Unit tests for component logic
- Integration tests for user flows
- Accessibility testing
- Visual regression testing

## 🔒 Security

### Input Validation
- Client-side validation with Zod
- XSS prevention
- CSRF protection
- Sanitized HTML rendering

### Data Handling
- Secure prop passing
- Sensitive data masking
- Proper error boundaries
- Loading state management