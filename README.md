# Pickems

A dynamic prediction platform where users compete by making predictions and earn points based on the contrarian value of their correct picks.

## Overview

Pickems is built with [Wasp](https://wasp-lang.dev/), combining React and Node.js with Discord authentication. The scoring system rewards users who make correct predictions against the majority, making each choice a strategic decision.

## Features

- **Risk-Reward Scoring**: Points awarded scale with how many users voted against the correct prediction
- **Discord Integration**: Seamless authentication and user management
- **Real-time Updates**: Live leaderboard and contest tracking
- **Admin Dashboard**: Contest management and prediction moderation

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.server.example .env.server
# Configure Discord OAuth credentials in .env.server

# Start development server
wasp start
```

## Development

### Prerequisites

- Node.js (LTS)
- PostgreSQL
- Discord Developer Application
- Wasp CLI

### Environment Setup

1. Create a Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Configure OAuth2 credentials
3. Update `.env.server` with your credentials

### Architecture

- `src/` - Application source code
  - `actions.js` - Server-side operations
  - `queries.js` - Data fetching logic
  - `components/` - Reusable React components
  - `pages/` - Route-specific views
  - `auth/` - Authentication logic

## Testing

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT

## Documentation

Detailed documentation available in the [docs](./docs) directory:
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Development Guide](./docs/DEVELOPMENT.md) 