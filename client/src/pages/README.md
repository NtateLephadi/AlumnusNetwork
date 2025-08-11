# Pages Directory

Route-level page components representing the main screens and views of the UCT SCF Alumni Hub application.

## 📁 Page Structure

```
pages/
├── landing.tsx      # Public landing page with authentication
├── home.tsx         # Main dashboard after login
├── profile.tsx      # User profile management
├── events.tsx       # Event listing and management
├── donations.tsx    # Donation platform and banking
├── admin-users.tsx  # Administrative user management
└── not-found.tsx    # 404 error page
```

## 🚪 Page Descriptions

### **landing.tsx** - Welcome Page
**Route**: `/`
**Purpose**: Application entry point and authentication gateway

**Features**:
- UCT SCF branding and mission statement
- Replit Auth integration
- Welcome message for new users
- Responsive hero section
- Call-to-action for registration

**Access**: Public (unauthenticated users)

### **home.tsx** - Dashboard
**Route**: `/home`
**Purpose**: Main user dashboard with community overview

**Features**:
- Personalized welcome message
- Featured events carousel
- Community statistics
- Social feed with posts
- Quick action buttons
- Notification center

**Access**: Authenticated and approved users only

### **profile.tsx** - Profile Management
**Route**: `/profile`
**Purpose**: User profile editing and personal information

**Features**:
- Personal information form
- Academic background
- Professional details
- Favorite Bible verse section
- Profile image upload
- Privacy settings

**Access**: Authenticated users (self-service)

### **events.tsx** - Event Hub
**Route**: `/events`
**Purpose**: Event discovery, creation, and management

**Features**:
- Event listing with filters
- Event creation modal (authorized users)
- RSVP functionality
- Event editing (organizers only)
- Donation integration
- Calendar view

**Access**: Authenticated users, admin controls for management

### **donations.tsx** - Donation Platform
**Route**: `/donations`
**Purpose**: Community fundraising and donation management

**Features**:
- Active donation campaigns
- Banking details display
- Donation history
- Payment instructions
- Goal tracking
- Admin banking management

**Access**: Authenticated users, admin controls for banking

### **admin-users.tsx** - User Administration
**Route**: `/admin/users`
**Purpose**: Administrative user management and oversight

**Features**:
- Pending user approvals
- User listing and search
- Role management
- Banking details configuration
- User statistics
- Bulk operations

**Access**: Admin users only

### **not-found.tsx** - Error Page
**Route**: `*` (catch-all)
**Purpose**: Handle invalid routes gracefully

**Features**:
- Friendly error message
- Navigation back to home
- UCT branding consistency
- Contact information

**Access**: All users

## 🏗 Page Architecture

### Common Patterns

#### Authentication Guards
```typescript
const { isAuthenticated, isApproved, isAdmin } = useAuth();

if (!isAuthenticated) return <Navigate to="/" />;
if (!isApproved) return <PendingApproval />;
```

#### Layout Structure
```typescript
return (
  <div className="min-h-screen bg-uct-blue">
    <Navigation />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page content */}
    </main>
  </div>
);
```

#### Data Fetching
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/endpoint'],
  enabled: !!isAuthenticated
});
```

## 🎨 Design Consistency

### Theme Application
- **Background**: Navy blue (`bg-uct-blue`) for brand consistency
- **Cards**: White background with shadow for content areas
- **Typography**: Consistent heading hierarchy
- **Spacing**: Standardized padding and margins

### Responsive Design
```typescript
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div className="lg:col-span-1">{/* Sidebar */}</div>
</div>
```

### Loading States
```typescript
if (isLoading) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## 🔐 Access Control

### Route Protection
- **Public**: Landing page only
- **Authenticated**: Dashboard, profile, events, donations
- **Approved Users**: Full application access
- **Admin Only**: User management, banking configuration

### Permission Checks
```typescript
const canEdit = user?.id === event.organizerId || isAdmin;
const canApprove = isAdmin && user?.role === 'admin';
```

## 📱 Mobile Optimization

### Navigation
- Mobile-responsive navigation bar
- Touch-friendly interactions
- Collapsible sidebar on mobile
- Bottom navigation (future)

### Content Layout
- Single-column layout on mobile
- Stacked cards for better touch interaction
- Optimized form inputs
- Readable typography scales

## 🚀 Performance

### Code Splitting
Pages are automatically code-split by the router:
```typescript
// Automatic code splitting per route
const LazyHomePage = lazy(() => import('./pages/home'));
```

### Data Optimization
- Efficient queries with TanStack Query
- Pagination for large datasets
- Optimistic updates
- Background refetching

## 🧪 Testing

### Page Testing Strategy
```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const renderWithProviders = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </QueryClientProvider>
  );
};
```

### Integration Testing
- Full user flow testing
- Authentication flow testing
- Form submission testing
- Navigation testing