# Shared Types & Schemas

Common TypeScript definitions and database schemas shared between the client and server applications.

## 🎯 Purpose

This directory contains shared code that ensures type safety and consistency across the frontend and backend:

- Database schema definitions
- TypeScript type definitions
- Validation schemas
- Common interfaces

## 📁 File Structure

```
shared/
└── schema.ts       # Drizzle database schema and types
```

## 🗃 Database Schema (`schema.ts`)

### Core Tables

#### Users
- User profiles and authentication data
- Personal information and preferences
- Academic and professional details
- Community engagement settings

#### Events
- Event management and scheduling
- Speaker information and venue details
- Donation goals and fundraising
- RSVP tracking and attendance

#### Posts
- Community social feed
- User-generated content
- Engagement tracking
- Content moderation

#### Donations & Banking
- Donation transactions
- Banking details management
- Payment references
- Financial reporting

#### Notifications
- System notifications
- User activity alerts
- Administrative messages
- Real-time updates

### Type Generation

#### Insert Schemas
Generated using `createInsertSchema` from `drizzle-zod`:
- Form validation
- API request validation
- Data transformation
- Type safety

#### Select Types
Auto-generated from table definitions:
- Database query results
- API response types
- Component props
- State management

## 🔧 Usage Examples

### Frontend Usage
```typescript
import { type User, type Event, insertEventSchema } from '@/shared/schema';

// Type-safe API responses
const user: User = await fetchUser();

// Form validation
const eventForm = useForm<InsertEvent>({
  resolver: zodResolver(insertEventSchema)
});
```

### Backend Usage
```typescript
import { users, events, insertEventSchema } from '@/shared/schema';

// Database queries
const allUsers = await db.select().from(users);

// Request validation
const validatedEvent = insertEventSchema.parse(requestBody);
```

## 🛡 Validation

### Zod Integration
- Runtime type validation
- Form input validation
- API request/response validation
- Error message generation

### Schema Validation Rules
- Required fields enforcement
- Data type validation
- Format validation (email, phone, etc.)
- Length constraints

## 🔄 Schema Evolution

### Migration Strategy
- Backward compatible changes
- Version control integration
- Database migration scripts
- Type safety preservation

### Best Practices
- Add new fields as optional first
- Use descriptive field names
- Document breaking changes
- Test schema changes thoroughly

## 📊 Relationships

### Table Relationships
- Foreign key constraints
- One-to-many relationships
- Many-to-many relationships
- Cascade delete rules

### Query Relationships
- Join operations
- Nested data fetching
- Related data loading
- Performance optimization

## 🧪 Testing

- Schema validation tests
- Type compatibility tests
- Migration testing
- Data integrity checks

## 📈 Performance

- Indexed columns
- Query optimization
- Bulk operations
- Efficient data types

## 🔒 Security

- Input sanitization
- SQL injection prevention
- Data validation
- Access control integration