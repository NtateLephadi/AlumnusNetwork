# UCT SCF Alumni Hub

A comprehensive community platform designed to empower University of Cape Town (UCT) Student Christian Fellowship (SCF) alumni through networking, event management, and community engagement.

## 🌟 Features

- **User Authentication & Profiles**: Secure authentication with comprehensive profile management
- **Event Management**: Create, manage, and RSVP to community events
- **Donation System**: Integrated donation platform with banking details management
- **Community Feed**: Social posts and community interactions
- **Admin Dashboard**: Complete administrative oversight and user management
- **Responsive Design**: Mobile-first approach with navy UCT branding

## 🚀 Tech Stack

- **Frontend**: React.js with TypeScript
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth integration
- **Build Tool**: Vite
- **State Management**: TanStack Query (React Query)

## 📁 Project Structure

```
├── attached_assets/     # Static assets and uploaded files
├── client/             # Frontend React application
├── server/             # Backend Express server
├── shared/             # Shared types and schemas
├── components.json     # shadcn/ui configuration
├── drizzle.config.ts   # Database configuration
├── package.json        # Dependencies and scripts
├── tailwind.config.ts  # Tailwind CSS configuration
└── vite.config.ts      # Vite build configuration
```

## 🛠 Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Replit environment (recommended)

### Setup
1. Install dependencies: `npm install`
2. Configure environment variables (see `.env.example`)
3. Run database migrations: `npm run db:push`
4. Start development server: `npm run dev`

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

## 🎨 Design System

The application uses a consistent navy blue theme reflecting UCT branding:
- Primary color: UCT Blue (#003366)
- Typography: Clean, readable font hierarchy
- Components: shadcn/ui with custom UCT styling
- Layout: Mobile-responsive grid system

## 📱 Key Pages

- **Landing**: Welcome page with authentication
- **Dashboard**: Personalized user dashboard
- **Events**: Event listing and management
- **Donations**: Community fundraising
- **Profile**: User profile management
- **Admin**: Administrative controls

## 🔒 Security Features

- Secure authentication flow
- Role-based access control
- Input validation and sanitization
- Protected API routes
- Session management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or questions about the UCT SCF Alumni Hub, please contact the development team.

---

*Building stronger communities, one connection at a time.*