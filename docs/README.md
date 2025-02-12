# Pickems Project Documentation

## Overview
This project is a web application for managing and participating in pick'em contests. It's built using the Wasp framework, which combines React for the frontend and Node.js for the backend, with Prisma as the ORM.

## Key Features
- Discord authentication for user management
- Nickname management system
- Pick'em contest creation and participation
- Admin dashboard for contest management
- User settings and preferences

## Project Structure
- `/src` - Main source code directory
  - `/auth` - Authentication related code
  - `/components` - Reusable React components
  - `/pages` - Main application pages
- `main.wasp` - Wasp configuration and route definitions
- `schema.prisma` - Database schema definition

## Getting Started
1. Install dependencies: `npm install`
2. Set up environment variables (see `.env.server`)
3. Start the development server: `wasp start`

## Documentation Index
- [Architecture Overview](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md) 