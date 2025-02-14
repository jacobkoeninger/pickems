// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.JWT_SECRET = 'test_secret'
process.env.DISCORD_CLIENT_ID = 'test_client_id'
process.env.DISCORD_CLIENT_SECRET = 'test_client_secret'

// Mock Wasp dependencies
jest.mock('wasp/server', () => ({
  HttpError: class HttpError extends Error {
    constructor(statusCode, message) {
      super(message)
      this.statusCode = statusCode
    }
  }
}));

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    // Add other Prisma methods as needed
  }))
})); 