# Library Directory

Utility functions, configurations, and helper modules that provide core functionality across the UCT SCF Alumni Hub application.

## 📁 Library Structure

```
lib/
├── authUtils.ts     # Authentication utility functions
├── queryClient.ts   # TanStack Query configuration and client
└── utils.ts         # General utility functions and helpers
```

## 🔧 Library Modules

### **authUtils.ts** - Authentication Utilities
**Purpose**: Helper functions for authentication and authorization logic

**Functions**:
```typescript
// Check if user has required role
export function hasRole(user: User, requiredRole: string): boolean;

// Check if user can edit resource
export function canEdit(user: User, resource: { organizerId: string }): boolean;

// Format user display name
export function getDisplayName(user: User): string;

// Check if user profile is complete
export function isProfileComplete(user: User): boolean;
```

**Usage Examples**:
```typescript
// Role-based access control
if (hasRole(user, 'admin')) {
  return <AdminPanel />;
}

// Resource ownership check
{canEdit(user, event) && <EditButton />}

// Profile completion check
if (!isProfileComplete(user)) {
  return <CompleteProfilePrompt />;
}
```

### **queryClient.ts** - Query Client Configuration
**Purpose**: TanStack Query setup and API request utilities

**Components**:
- **Query Client**: Global configuration for caching and background updates
- **API Request Function**: Centralized HTTP request handling
- **Error Handling**: Global error boundary and notification integration
- **Cache Management**: Invalidation and update strategies

**Configuration**:
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

**API Request Helper**:
```typescript
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  // Centralized request handling
  // Authentication headers
  // Error handling
  // Response transformation
}
```

**Usage Examples**:
```typescript
// Query with global client
const { data } = useQuery({
  queryKey: ['/api/events'],
  queryFn: () => apiRequest('/api/events'),
});

// Mutation with error handling
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/events', {
    method: 'POST',
    body: data,
  }),
  onSuccess: () => {
    queryClient.invalidateQueries(['/api/events']);
  },
});
```

### **utils.ts** - General Utilities
**Purpose**: Common utility functions and helper methods

**Functions**:
```typescript
// Tailwind class name merging
export function cn(...inputs: ClassValue[]): string;

// Date formatting utilities
export function formatDate(date: string | Date): string;
export function formatRelativeTime(date: string | Date): string;

// String utilities
export function truncate(text: string, length: number): string;
export function slugify(text: string): string;

// Number formatting
export function formatCurrency(amount: number): string;
export function formatNumber(num: number): string;

// Validation helpers
export function isValidEmail(email: string): boolean;
export function isValidUrl(url: string): boolean;

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]>;
export function unique<T>(array: T[]): T[];
```

**Usage Examples**:
```typescript
// Class name merging
<div className={cn("base-class", condition && "conditional-class", className)} />

// Date formatting
<span>{formatDate(event.date)}</span>
<span>{formatRelativeTime(post.createdAt)}</span>

// Text truncation
<p>{truncate(description, 150)}</p>

// Currency formatting
<span>{formatCurrency(donation.amount)}</span>

// Data grouping
const eventsByMonth = groupBy(events, 'date');
```

## 🎯 Design Principles

### Single Responsibility
Each utility function has a single, well-defined purpose:
```typescript
// Good - single purpose
export function formatCurrency(amount: number): string;

// Avoid - multiple responsibilities
export function formatAndValidateCurrency(amount: unknown): string;
```

### Type Safety
All utilities include proper TypeScript typing:
```typescript
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}
```

### Performance Optimization
```typescript
// Memoized expensive calculations
export const expensiveCalculation = memoize((input: ComplexType) => {
  return performExpensiveOperation(input);
});

// Debounced functions
export const debouncedSearch = debounce((query: string) => {
  performSearch(query);
}, 300);
```

## 🔄 Integration Patterns

### With React Components
```typescript
import { cn, formatDate } from '@/lib/utils';

function EventCard({ event, className }) {
  return (
    <div className={cn("event-card", className)}>
      <h3>{event.title}</h3>
      <span>{formatDate(event.date)}</span>
    </div>
  );
}
```

### With API Handling
```typescript
import { apiRequest } from '@/lib/queryClient';

export async function createEvent(eventData: CreateEventData) {
  return apiRequest<Event>('/api/events', {
    method: 'POST',
    body: eventData,
  });
}
```

### Error Boundaries
```typescript
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
```

## 🧪 Testing Utilities

### Test Helpers
```typescript
// Mock data generators
export function createMockUser(overrides?: Partial<User>): User;
export function createMockEvent(overrides?: Partial<Event>): Event;

// Test utilities
export function renderWithProviders(component: ReactElement);
export function createTestQueryClient(): QueryClient;

// Assertion helpers
export function expectToBeVisible(element: HTMLElement);
export function expectToHaveClass(element: HTMLElement, className: string);
```

### Mock Functions
```typescript
// API mocking
export const mockApiRequest = jest.fn();
export const mockQueryClient = {
  invalidateQueries: jest.fn(),
  setQueryData: jest.fn(),
};
```

## 📊 Performance Considerations

### Bundle Optimization
```typescript
// Tree-shakable exports
export { cn } from './classNames';
export { formatDate } from './dateUtils';
export { apiRequest } from './apiUtils';

// Avoid default exports for better tree-shaking
```

### Lazy Loading
```typescript
// Dynamic imports for heavy utilities
export const heavyUtility = () =>
  import('./heavyUtility').then(module => module.default);
```

## 🔒 Security Utilities

### Input Sanitization
```typescript
export function sanitizeHtml(input: string): string;
export function escapeRegExp(string: string): string;
export function validateInput<T>(input: unknown, schema: z.ZodSchema<T>): T;
```

### Authentication Helpers
```typescript
export function isTokenExpired(token: string): boolean;
export function generateCSRFToken(): string;
export function validatePermission(user: User, resource: Resource): boolean;
```

## 📈 Monitoring and Analytics

### Performance Tracking
```typescript
export function trackPerformance(name: string, fn: () => void): void;
export function measureExecutionTime<T>(
  name: string,
  fn: () => T
): T;
```

### Error Tracking
```typescript
export function logError(error: Error, context?: Record<string, any>): void;
export function captureException(error: Error): void;
```