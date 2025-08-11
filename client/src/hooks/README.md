# Hooks Directory

Custom React hooks providing reusable logic and state management across the UCT SCF Alumni Hub application.

## 📁 Hook Structure

```
hooks/
├── useAuth.ts         # Authentication state and user management
├── use-toast.ts       # Toast notification system
└── use-mobile.tsx     # Mobile device detection
```

## 🎯 Hook Descriptions

### **useAuth.ts** - Authentication Management
**Purpose**: Centralized authentication state and user session management

**Features**:
- User authentication status
- User profile data access
- Role-based permissions
- Admin privilege checking
- Approval status tracking

**API**:
```typescript
const {
  user,              // Current user data
  isAuthenticated,   // Authentication status
  isApproved,        // User approval status
  isAdmin,          // Admin privilege check
  isLoading,        // Loading state
  logout            // Logout function
} = useAuth();
```

**Usage Examples**:
```typescript
// Route protection
if (!isAuthenticated) return <Navigate to="/" />;

// Conditional rendering
{isAdmin && <AdminPanel />}

// User information display
<p>Welcome, {user?.firstName}!</p>
```

### **use-toast.ts** - Toast Notifications
**Purpose**: Global toast notification system for user feedback

**Features**:
- Success, error, and info messages
- Automatic dismissal
- Custom duration settings
- Action buttons support
- Queue management

**API**:
```typescript
const { toast } = useToast();

toast({
  title: "Success!",
  description: "Your changes have been saved.",
  variant: "default" | "destructive",
  duration: 5000,
  action: <ToastAction>Undo</ToastAction>
});
```

**Usage Examples**:
```typescript
// Success notification
toast({
  title: "Event Created",
  description: "Your event has been successfully created.",
});

// Error notification
toast({
  title: "Error",
  description: "Failed to save changes. Please try again.",
  variant: "destructive",
});
```

### **use-mobile.tsx** - Mobile Device Detection
**Purpose**: Responsive design and mobile-specific behavior

**Features**:
- Screen size detection
- Mobile/desktop breakpoints
- Responsive component rendering
- Touch device detection

**API**:
```typescript
const isMobile = useMobile();
```

**Usage Examples**:
```typescript
// Conditional rendering
{isMobile ? <MobileNav /> : <DesktopNav />}

// Different layouts
<div className={isMobile ? "grid-cols-1" : "grid-cols-2"}>
```

## 🏗 Hook Architecture

### State Management Pattern
```typescript
export function useCustomHook() {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  
  const action = useCallback(async (params) => {
    setLoading(true);
    try {
      const result = await apiCall(params);
      setState(result);
    } catch (error) {
      console.error('Hook error:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { state, loading, action };
}
```

### Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const handleError = (error: Error) => {
    setError(error.message);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  };
}, []);
```

## 🚀 Best Practices

### Performance Optimization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Debounce frequent updates
const debouncedSearch = useDebouncedCallback(
  (searchTerm: string) => {
    performSearch(searchTerm);
  },
  300
);
```

### Memory Management
```typescript
useEffect(() => {
  const subscription = subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Type Safety
```typescript
interface UseCustomHookResult {
  data: DataType | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCustomHook(): UseCustomHookResult {
  // Implementation
}
```

## 🔄 Integration Patterns

### With TanStack Query
```typescript
export function useUserProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['/api/users', user?.id],
    queryFn: () => fetchUserProfile(user?.id!),
    enabled: !!user?.id,
  });
}
```

### With Form Handling
```typescript
export function useFormSubmission<T>(
  onSubmit: (data: T) => Promise<void>
) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = useCallback(async (data: T) => {
    setLoading(true);
    try {
      await onSubmit(data);
      toast({ title: "Success!", description: "Form submitted." });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Submission failed.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [onSubmit, toast]);
  
  return { handleSubmit, loading };
}
```

## 🧪 Testing Hooks

### Hook Testing Setup
```typescript
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('useAuth returns user data', async () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: createWrapper(),
  });
  
  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### Mock Strategies
```typescript
// Mock API responses
jest.mock('@/lib/api', () => ({
  fetchUser: jest.fn(() => Promise.resolve(mockUser)),
}));

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
});
```

## 🔒 Security Considerations

### Authentication Hooks
- Secure token handling
- Automatic session refresh
- Logout on token expiry
- CSRF protection

### Data Validation
```typescript
export function useValidatedInput<T>(
  schema: z.ZodSchema<T>
) {
  const [value, setValue] = useState<T>();
  const [error, setError] = useState<string>();
  
  const validate = (input: unknown) => {
    try {
      const validated = schema.parse(input);
      setValue(validated);
      setError(undefined);
    } catch (err) {
      setError(err.message);
    }
  };
  
  return { value, error, validate };
}
```

## 📈 Performance Monitoring

### Custom Performance Hooks
```typescript
export function usePerformanceMonitor(name: string) {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`${name} rendered in ${end - start}ms`);
    };
  });
}
```

### Memory Usage Tracking
```typescript
export function useMemoryTracking() {
  useEffect(() => {
    if ('memory' in performance) {
      console.log('Memory usage:', performance.memory);
    }
  });
}
```