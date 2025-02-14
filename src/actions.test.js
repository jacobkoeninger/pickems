import { 
  updateUser, createPickem, createUserPickemChoice, 
  updatePickemChoiceOwner, createContest, deleteContest,
  closePickem, bulkCreatePickems 
} from './actions.js';

// Create mock entities directly
const mockEntities = {
  User: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  },
  Pickem: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn()
  },
  PickemChoice: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn()
  },
  UserPickemChoice: {
    create: jest.fn(),
    findMany: jest.fn(),
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

// Mock context setup
const mockContext = {
  user: {
    id: 1,
    username: 'testUser',
    nickname: 'TEST_AGENT',
    isAdmin: false
  },
  entities: mockEntities
};

// Helper to create admin context
const adminContext = {
  ...mockContext,
  user: { ...mockContext.user, isAdmin: true }
};

// Mock HttpError class
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

describe('updateUser', () => {
  beforeEach(() => {
    // Clear all mock implementations and calls
    Object.values(mockEntities).forEach(entity => {
      Object.values(entity).forEach(method => {
        method.mockClear();
      });
    });
  });

  test('requires authentication', async () => {
    await expect(updateUser({ username: 'test' }, { ...mockContext, user: null }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  test('requires username to be at least 3 characters', async () => {
    await expect(updateUser({ username: 'ab' }, mockContext))
      .rejects.toThrow('Username must be at least 3 characters long');
  });

  test('checks for username uniqueness', async () => {
    mockEntities.User.findUnique.mockResolvedValueOnce({ id: 2 });
    await expect(updateUser({ username: 'takenname' }, mockContext))
      .rejects.toThrow('Username is already taken');
  });

  test('checks for nickname uniqueness', async () => {
    mockEntities.User.findUnique
      .mockResolvedValueOnce(null)  // username check
      .mockResolvedValueOnce({ id: 2 }); // nickname check
    await expect(updateUser({ username: 'validname', nickname: 'TAKEN' }, mockContext))
      .rejects.toThrow('Nickname is already taken');
  });

  test('successfully updates user', async () => {
    mockEntities.User.findUnique.mockResolvedValue(null);
    await updateUser({ username: 'newname', nickname: 'NEW_AGENT' }, mockContext);
    expect(mockEntities.User.update).toHaveBeenCalled();
  });
});

describe('createPickem', () => {
  const validArgs = {
    choices: ['Choice 1', 'Choice 2'],
    categoryId: 1,
    contestId: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires authentication', async () => {
    await expect(createPickem(validArgs, { ...mockContext, user: null }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  test('requires either categoryId or categoryName', async () => {
    await expect(createPickem({ ...validArgs, categoryId: null }, mockContext))
      .rejects.toThrow('Either categoryId or categoryName must be provided');
  });

  test('creates pickem with choices', async () => {
    mockEntities.Pickem.create.mockResolvedValueOnce({
      id: 1,
      choices: [{ id: 1, nickname: 'TEST_AGENT' }]
    });
    await createPickem(validArgs, mockContext);
    expect(mockEntities.Pickem.create).toHaveBeenCalled();
    expect(mockEntities.UserPickemChoice.create).toHaveBeenCalled();
  });
});

describe('createUserPickemChoice', () => {
  const validArgs = {
    userId: 1,
    pickemChoiceId: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires authentication', async () => {
    await expect(createUserPickemChoice(validArgs, { ...mockContext, user: null }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  test('prevents choosing for other users', async () => {
    await expect(createUserPickemChoice({ ...validArgs, userId: 2 }, mockContext))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  test('prevents choosing on closed pickems', async () => {
    mockEntities.PickemChoice.findUnique.mockResolvedValueOnce({
      pickem: { correctChoiceId: 1, contest: { deadline: new Date() } }
    });
    await expect(createUserPickemChoice(validArgs, mockContext))
      .rejects.toThrow('Pickem is already closed');
  });

  test('prevents choosing after deadline', async () => {
    mockEntities.PickemChoice.findUnique.mockResolvedValueOnce({
      pickem: { 
        correctChoiceId: null,
        contest: { deadline: new Date('2000-01-01') }
      }
    });
    await expect(createUserPickemChoice(validArgs, mockContext))
      .rejects.toThrow('Contest deadline has passed');
  });

  test('successfully creates choice', async () => {
    mockEntities.PickemChoice.findUnique.mockResolvedValueOnce({
      pickem: { 
        id: 1,
        correctChoiceId: null,
        contest: { deadline: new Date('2100-01-01') }
      }
    });
    await createUserPickemChoice(validArgs, mockContext);
    expect(mockEntities.UserPickemChoice.create).toHaveBeenCalled();
  });
});

describe('updatePickemChoiceOwner', () => {
  const validArgs = {
    pickemChoiceId: 1,
    newOwnerId: 2
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires admin access', async () => {
    await expect(updatePickemChoiceOwner(validArgs, mockContext))
      .rejects.toThrow('Only admins can update choice owners');
  });

  test('prevents updating closed pickem choices', async () => {
    adminContext.entities.PickemChoice.findUnique.mockResolvedValueOnce({
      pickem: { correctChoiceId: 1 }
    });
    await expect(updatePickemChoiceOwner(validArgs, adminContext))
      .rejects.toThrow('Cannot update owner of choice in closed pickem');
  });

  test('successfully updates owner', async () => {
    adminContext.entities.PickemChoice.findUnique.mockResolvedValueOnce({
      pickem: { correctChoiceId: null }
    });
    await updatePickemChoiceOwner(validArgs, adminContext);
    expect(adminContext.entities.PickemChoice.update).toHaveBeenCalled();
  });
});

describe('createContest', () => {
  const validArgs = {
    name: 'Test Contest',
    description: 'Test Description',
    deadline: '2100-01-01'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires admin access', async () => {
    await expect(createContest(validArgs, mockContext))
      .rejects.toThrow('Only admins can create contests');
  });

  test('successfully creates contest', async () => {
    await createContest(validArgs, adminContext);
    expect(adminContext.entities.Contest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: validArgs.name,
        description: validArgs.description
      })
    });
  });
});

describe('deleteContest', () => {
  const validArgs = {
    contestId: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires admin access', async () => {
    await expect(deleteContest(validArgs, mockContext))
      .rejects.toThrow('Only admins can delete contests');
  });

  test('deletes contest and related data', async () => {
    await deleteContest(validArgs, adminContext);
    expect(adminContext.entities.UserPickemChoice.deleteMany).toHaveBeenCalled();
    expect(adminContext.entities.PickemChoice.deleteMany).toHaveBeenCalled();
    expect(adminContext.entities.Pickem.deleteMany).toHaveBeenCalled();
    expect(adminContext.entities.Contest.delete).toHaveBeenCalled();
  });
});

describe('closePickem', () => {
  const validArgs = {
    pickemId: 1,
    correctChoiceId: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires authentication', async () => {
    await expect(closePickem(validArgs, { ...mockContext, user: null }))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  test('prevents closing already closed pickems', async () => {
    mockEntities.Pickem.findUnique.mockResolvedValueOnce({
      correctChoiceId: 1,
      choices: []
    });
    await expect(closePickem(validArgs, mockContext))
      .rejects.toThrow('Pickem is already closed');
  });

  test('distributes points correctly', async () => {
    mockEntities.Pickem.findUnique.mockResolvedValueOnce({
      correctChoiceId: null,
      choices: [{ id: 1 }]
    });
    mockEntities.UserPickemChoice.findMany
      .mockResolvedValueOnce([{ userId: 2 }, { userId: 3 }]) // incorrect choices
      .mockResolvedValueOnce([{ userId: 4 }]); // correct choices
    
    await closePickem(validArgs, mockContext);
    expect(mockEntities.User.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { points: { increment: 2 } }
      })
    );
  });
});

describe('bulkCreatePickems', () => {
  const validData = {
    contestId: '1',
    pickems: [{
      category: 'TEST',
      prediction1: { text: 'Choice 1', owner: 'AGENT1' },
      prediction2: { text: 'Choice 2', owner: 'AGENT2' }
    }]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires admin access', async () => {
    const nonAdminContext = { user: { id: 1, isAdmin: false }, entities: mockEntities };
    await expect(bulkCreatePickems(validData, nonAdminContext))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  test('validates input format', async () => {
    await expect(bulkCreatePickems({ pickems: null }, adminContext))
      .rejects.toThrow('Invalid pickems format');
  });

  test('enforces size limits', async () => {
    const tooManyPickems = {
      contestId: '1',
      pickems: Array(101).fill(validData.pickems[0])
    };
    await expect(bulkCreatePickems(tooManyPickems, adminContext))
      .rejects.toThrow('Bulk upload limited to');
  });

  test('creates or reuses categories', async () => {
    // Mock contest lookup
    mockEntities.Contest.findUnique.mockResolvedValueOnce({
      id: 1,
      isActive: true
    });

    // Mock category lookup to return null first (not found)
    mockEntities.PickemCategory.findFirst.mockResolvedValueOnce(null);
    
    // Mock category creation to return a new category
    mockEntities.PickemCategory.create.mockResolvedValueOnce({ 
      id: 1, 
      name: 'TEST' 
    });

    // Mock pickem creation
    mockEntities.Pickem.create.mockResolvedValueOnce({
      id: 1,
      categoryId: 1,
      choices: [
        { id: 1, text: 'Choice 1', nickname: 'AGENT1' },
        { id: 2, text: 'Choice 2', nickname: 'AGENT2' }
      ]
    });

    const result = await bulkCreatePickems(validData, adminContext);
    expect(result).toHaveLength(1);
    expect(mockEntities.PickemCategory.create).toHaveBeenCalled();
    expect(mockEntities.Pickem.create).toHaveBeenCalled();
  });
}); 