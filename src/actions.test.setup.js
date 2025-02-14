// Mock entities
export const mockEntities = {
  User: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  },
  Pickem: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  PickemChoice: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  UserPickemChoice: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn()
  },
  Contest: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  PickemCategory: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn()
  }
};

// Mock contexts
export const mockContext = {
  user: {
    id: 1,
    username: 'testuser',
    isAdmin: false
  },
  entities: mockEntities
};

export const adminContext = {
  user: {
    id: 1,
    username: 'admin',
    isAdmin: true
  },
  entities: mockEntities
};

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 