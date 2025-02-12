# Development Guide

## Development Setup

### Prerequisites
- Node.js (LTS version recommended)
- PostgreSQL database
- Discord Developer Application (for OAuth2)
- Wasp CLI installed globally

### Environment Configuration
1. Copy `.env.server.example` to `.env.server`
2. Configure the following variables:
   - Discord OAuth credentials
   - Database connection string
   - Other environment-specific settings

### Local Development
1. Start the development server:
   ```bash
   wasp start
   ```
2. Access the application at `http://localhost:3000`

## Project Guidelines

### Cursor AI Rules
The project uses Cursor AI rules to maintain consistency and best practices:

- `.cursor/rules/base.mdc`: Core project principles and standards
- `.cursor/rules/src/components.mdc`: React component guidelines
- `.cursor/rules/src/auth.mdc`: Authentication-related rules

These rules help ensure:
- Consistent code style and patterns
- Security best practices
- Proper documentation
- Type safety
- Performance optimization

### Code Structure
- Keep components focused and single-responsibility
- Use TypeScript for type safety
- Follow the existing project structure:
  - New pages go in `src/pages`
  - Reusable components in `src/components`
  - Backend operations in appropriate action/query files

### Styling
- Use TailwindCSS for styling
- Follow the existing color scheme and design patterns
- Maintain responsive design principles

### State Management
- Use React hooks for local state
- Leverage Wasp's built-in state management
- Keep complex state logic in dedicated hooks

### Testing
- Write tests for critical functionality
- Test both frontend components and backend logic
- Ensure all API endpoints are properly tested

### Git Workflow
1. Create feature branches from `main`
2. Use descriptive commit messages
3. Submit PRs for review
4. Ensure all tests pass before merging

## Common Tasks

### Adding New Features
1. Plan the feature scope
2. Update schema if needed
3. Implement backend logic
4. Create/update frontend components
5. Add necessary tests
6. Update documentation

### Troubleshooting
- Check the console for errors
- Verify environment variables
- Ensure database migrations are up to date
- Check Discord OAuth configuration

## Deployment
- Follow the Wasp deployment guidelines
- Update environment variables
- Run database migrations
- Test in staging environment first 