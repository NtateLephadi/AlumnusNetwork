# Client Application

The frontend React application for the UCT SCF Alumni Hub, built with modern web technologies and best practices.

## 🏗 Architecture

### Framework & Tools
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library

### State Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state and validation
- **Context API**: Global application state

## 📁 Directory Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── App.tsx        # Main application component
├── main.tsx       # Application entry point
└── index.css      # Global styles and CSS variables
```

## 🎨 Styling

### Theme System
- Custom CSS variables for consistent theming
- Dark/light mode support (future enhancement)
- UCT brand colors and typography
- Responsive breakpoints

### Component Library
- shadcn/ui components with custom styling
- Consistent spacing and typography scale
- Accessible design patterns
- Mobile-first responsive design

## 🛣 Routing

Using `wouter` for client-side routing:
- Lightweight and fast
- Hook-based navigation
- Nested routing support
- Clean URL structures

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: mobile (default), tablet (768px+), desktop (1024px+)
- Touch-friendly interactions
- Optimized for various screen sizes

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style
- ESLint for code quality
- TypeScript strict mode
- Consistent import organization
- Component naming conventions

## 🚀 Performance

### Optimizations
- Code splitting by routes
- Lazy loading of components
- Image optimization
- Bundle size monitoring

### Best Practices
- Memoization of expensive calculations
- Proper dependency arrays in hooks
- Avoiding unnecessary re-renders
- Efficient state updates

## 🧪 Testing

- Component testing setup ready
- Integration test patterns
- Mock service worker for API testing
- Accessibility testing guidelines

## 🔒 Security

- XSS protection through proper escaping
- Content Security Policy headers
- Secure API communication
- Input validation on forms