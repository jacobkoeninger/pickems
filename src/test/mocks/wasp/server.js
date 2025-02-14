export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

export const prisma = {
  User: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  },
  Pickem: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn()
  },
  PickemChoice: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn()
  },
  UserPickemChoice: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    deleteMany: jest.fn()
  },
  Contest: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn()
  },
  PickemCategory: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn()
  }
}; 