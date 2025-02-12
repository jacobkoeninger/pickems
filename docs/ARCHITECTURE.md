# Architecture Overview

## Tech Stack
- **Frontend**: React with TailwindCSS
- **Backend**: Node.js (via Wasp framework)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Discord OAuth2
- **Framework**: Wasp (full-stack framework)

## System Components

### Authentication Flow
The application uses Discord OAuth2 for authentication. The flow is handled in `src/auth/discord.js`, which manages:
- User authentication
- Token management
- User profile synchronization

### Data Model
The core data model is defined in `schema.prisma` and includes:
- Users
- Nicknames
- Contests
- Picks
- Teams

### Key Components
1. **Contest Management**
   - Contest creation and configuration
   - Pick submission and validation
   - Results tracking

2. **User Management**
   - Discord integration
   - Nickname system
   - User preferences

3. **Admin Dashboard**
   - Contest oversight
   - User management
   - System configuration

## API Structure
The application's API is organized into:
- Actions (`src/actions.js`): Mutations and data modifications
- Queries (`src/queries.js`): Data fetching operations
- External APIs (`src/apis.js`): Third-party integrations

## Frontend Architecture
- Component-based structure using React
- Centralized layout system (`src/Layout.jsx`)
- Reusable components in `src/components`
- Page-specific components in `src/pages`

## Security Considerations
- OAuth2 for secure authentication
- Environment-based configuration
- Server-side validation
- Protected admin routes 