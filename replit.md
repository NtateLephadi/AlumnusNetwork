# UCT SCF Alumni Hub - Project Documentation

## Project Overview
A comprehensive community platform designed to empower University of Cape Town (UCT) Student Christian Fellowship (SCF) alumni through networking, event management, and community engagement. The platform includes authentication, profile management with personal details, event creation/management, and admin capabilities for platform oversight.

## Tech Stack
- **Frontend**: React.js with TypeScript, shadcn/ui components, Tailwind CSS
- **Backend**: Express.js with TypeScript, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Replit Auth integration
- **Build Tool**: Vite
- **State Management**: TanStack Query (React Query)

## Project Architecture

### Directory Structure
```
├── attached_assets/     # Static assets and uploaded files
├── client/             # Frontend React application
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── pages/      # Route components
│       ├── hooks/      # Custom React hooks
│       └── lib/        # Utility functions
├── server/             # Backend Express server
├── shared/             # Shared types and schemas
└── [config files]      # Build and configuration files
```

### Key Features
- User Authentication & Profiles with comprehensive profile management
- Event Management with creation, RSVP, and administrative oversight
- Donation System with integrated banking details and goal tracking
- Community Feed with social posts and interactions
- Admin Dashboard with complete user management and oversight
- Mobile-responsive design with UCT navy branding theme

## User Preferences
- **Design System**: Navy blue theme (#003366) for UCT branding consistency
- **Text Visibility**: White/light text on navy backgrounds for optimal readability
- **Component Library**: shadcn/ui with custom UCT styling
- **Documentation**: Comprehensive README files for every directory
- **Bible Verse Integration**: Prominently displayed in user profiles (personal interests section)

## Recent Changes

### January 11, 2025 - Multi-Provider Authentication Integration
- ✅ Added Microsoft OAuth authentication alongside existing Replit auth
- ✅ Added Google OAuth authentication for Gmail/Google Workspace accounts
- ✅ Created graceful fallback when OAuth credentials are not available
- ✅ Updated landing page to dynamically show available login methods
- ✅ Added authentication methods API endpoint for frontend detection
- ✅ Implemented comprehensive multi-provider authentication support

### January 11, 2025 - Comprehensive Documentation
- ✅ Created README files for every folder in the project (11 total README files)
- ✅ Documented project structure, architecture, and development guidelines
- ✅ Added usage examples, best practices, and security considerations
- ✅ Included component documentation, API references, and testing strategies
- ✅ Provided developer onboarding information and maintenance guidelines

### Previous Updates
- ✅ Fixed button text alignment across the platform (sidebar buttons properly centered)
- ✅ Made "Donate to Event" buttons fully functional with DonationModal integration  
- ✅ Applied consistent navy blue background theming across all major pages
- ✅ Fixed text visibility issues on navy backgrounds with white/light text colors
- ✅ Completed notification system with CRUD operations and real-time updates
- ✅ Updated dashboard and user management pages to navy background theme

## Technical Implementation Notes

### Design System
- **Primary Color**: UCT Blue (#003366) consistently applied
- **Background Strategy**: Navy backgrounds with white content cards
- **Text Strategy**: White headings, light gray descriptions on navy backgrounds
- **Component Styling**: shadcn/ui with custom UCT theme integration

### Database Schema
- Users table with comprehensive profile fields including Bible verse
- Events table with donation goals and speaker information
- Posts table for community social feed
- Notifications table for real-time updates
- Banking details for donation management

### Authentication Flow
- Replit Auth integration for secure authentication
- Role-based access control (admin, approved users)
- User approval system for community access
- Session management and protected routes

## Development Guidelines
- **Code Style**: TypeScript strict mode, ESLint configuration
- **Component Patterns**: React functional components with hooks
- **State Management**: TanStack Query for server state, React Hook Form for forms
- **Styling**: Tailwind CSS utility-first approach with custom CSS variables
- **Testing**: React Testing Library for component tests, integration test patterns
- **Documentation**: Comprehensive README files maintained for all directories

## Deployment
- **Environment**: Replit platform with PostgreSQL database
- **Build Process**: Vite for frontend bundling, TSX for backend compilation
- **Database**: Drizzle ORM with PostgreSQL, migrations via `npm run db:push`
- **Assets**: Static file management through attached_assets directory

## Performance Optimizations
- Code splitting by routes with lazy loading
- TanStack Query caching and background updates  
- Optimized image handling and responsive design
- Bundle size monitoring and tree-shaking

## Security Features
- Input validation with Zod schemas
- XSS prevention and CSRF protection
- Role-based access control implementation
- Secure API endpoints with authentication middleware