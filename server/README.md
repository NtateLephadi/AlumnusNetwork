# Server Application

The backend Express.js server for the UCT SCF Alumni Hub, providing secure APIs and business logic.

## 🏗 Architecture

### Framework & Tools
- **Express.js**: Fast, unopinionated web framework
- **TypeScript**: Type-safe server development
- **Drizzle ORM**: Modern TypeScript ORM
- **PostgreSQL**: Robust relational database
- **Replit Auth**: Integrated authentication system

### Key Features
- RESTful API design
- Session-based authentication
- Role-based access control
- Input validation and sanitization
- Comprehensive error handling

## 📁 File Structure

```
server/
├── db.ts           # Database connection and configuration
├── index.ts        # Main server application
├── replitAuth.ts   # Replit authentication integration
├── routes.ts       # API route definitions
├── storage.ts      # Data access layer and business logic
└── vite.ts         # Vite development server integration
```

## 🔧 Core Components

### Database Layer (`db.ts`)
- PostgreSQL connection management
- Connection pooling
- Environment-based configuration
- Health check endpoints

### Authentication (`replitAuth.ts`)
- Replit Auth integration
- Session management
- User profile synchronization
- OAuth callback handling

### API Routes (`routes.ts`)
- RESTful endpoint definitions
- Request validation
- Response formatting
- Error handling middleware

### Data Access (`storage.ts`)
- Business logic implementation
- Database query abstraction
- Data transformation
- Transaction management

## 🛡 Security Features

### Authentication & Authorization
- Secure session management
- Role-based access control (RBAC)
- Protected route middleware
- User approval system

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention
- XSS protection
- CORS configuration

### API Security
- Rate limiting (planned)
- Request size limits
- Secure headers
- Environment variable protection

## 🗃 Database Integration

### Drizzle ORM Features
- Type-safe queries
- Migration management
- Relationship handling
- Connection pooling

### Schema Management
- Centralized schema definitions
- Automatic type generation
- Database migrations
- Seed data management

## 🚀 API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/callback` - Handle auth callback
- `POST /api/logout` - User logout

### Users & Profiles
- `GET /api/users` - List users (admin)
- `PUT /api/users/:id` - Update user profile
- `GET /api/admin/pending-users` - Pending approvals

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Donations & Banking
- `GET /api/banking-details/active` - Get banking info
- `POST /api/donations` - Record donation
- `GET /api/admin/banking-details` - Manage banking

## 🔧 Development

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `REPLIT_DB_URL` - Replit database URL
- `NODE_ENV` - Environment mode
- `PORT` - Server port (default: 5000)

### Debugging
- Comprehensive logging
- Error tracking
- Performance monitoring
- Database query logging

## 📊 Performance

### Optimizations
- Connection pooling
- Query optimization
- Response caching
- Efficient data fetching

### Monitoring
- Request timing
- Database performance
- Memory usage
- Error rates

## 🧪 Testing

- Unit tests for business logic
- Integration tests for API endpoints
- Database test utilities
- Mock data generation

## 📈 Scalability

- Horizontal scaling ready
- Database indexing
- Caching strategies
- Load balancing support