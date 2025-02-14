import { 
  updateUser, createPickem, createUserPickemChoice, 
  updatePickemChoiceOwner, createContest, deleteContest,
  closePickem, bulkCreatePickems, automateAllUserChoices,
  createPickemWithPredefinedChoices
} from './actions.js';

// Create mock entities directly
const mockEntities = {
  User: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
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
      id: 1,
      pickem: { 
        id: 1,
        correctChoiceId: null,
        contest: { deadline: new Date('2100-01-01') },
        choices: [
          { id: 1, nickname: 'OTHER_AGENT' },
          { id: 2, nickname: 'ANOTHER_AGENT' }
        ]
      }
    });

    mockEntities.UserPickemChoice.findUnique.mockResolvedValueOnce(null);
    
    // Mock for updateUserStats
    mockEntities.UserPickemChoice.findMany.mockResolvedValueOnce([
      {
        pickemChoice: {
          id: 1,
          pickem: {
            correctChoiceId: null
          }
        }
      }
    ]);

    const result = await createUserPickemChoice(validArgs, mockContext);
    expect(result).toBeDefined();
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
      .rejects.toMatchObject({ statusCode: 401 });
  });

  test('prevents closing already closed pickems', async () => {
    mockEntities.Pickem.findUnique.mockResolvedValueOnce({
      correctChoiceId: 1,
      choices: [],
      contest: {
        isAdmin: () => true
      }
    });
    await expect(closePickem(validArgs, mockContext))
      .rejects.toThrow('Pickem is already closed');
  });

  test('distributes points correctly', async () => {
    // Mock the initial pickem query
    mockEntities.Pickem.findUnique.mockResolvedValueOnce({
      id: 1,
      correctChoiceId: null,
      choices: [
        { 
          id: 1,
          userChoices: [
            { 
              user: { id: 2 },
              userId: 2
            },
            {
              user: { id: 3 },
              userId: 3
            }
          ]
        },
        {
          id: 2,
          userChoices: [
            {
              user: { id: 4 },
              userId: 4
            }
          ]
        }
      ],
      contest: {
        isAdmin: () => true
      }
    });
    
    // Mock updateUserStats calls for each affected user
    mockEntities.UserPickemChoice.findMany
      .mockResolvedValueOnce([
        {
          pickemChoice: {
            id: 1,
            pickem: { correctChoiceId: 1 }
          }
        }
      ])
      .mockResolvedValueOnce([
        {
          pickemChoice: {
            id: 1,
            pickem: { correctChoiceId: 1 }
          }
        }
      ])
      .mockResolvedValueOnce([
        {
          pickemChoice: {
            id: 2,
            pickem: { correctChoiceId: 1 }
          }
        }
      ]);

    await closePickem(validArgs, adminContext);
    
    // Verify the pickem was updated with the correct choice
    expect(mockEntities.Pickem.update).toHaveBeenCalledWith({
      where: { id: validArgs.pickemId },
      data: { correctChoiceId: validArgs.correctChoiceId }
    });

    // Verify points were distributed - update the expected call count
    expect(mockEntities.User.update).toHaveBeenCalledTimes(5);
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

    // Mock findMany for automateUserChoices
    mockEntities.PickemChoice.findMany.mockResolvedValueOnce([]);

    const result = await bulkCreatePickems(validData, adminContext);
    expect(result).toEqual({
      createdPickems: expect.any(Array),
      automatedCount: expect.any(Number)
    });
    expect(result.createdPickems).toHaveLength(1);
    expect(mockEntities.PickemCategory.create).toHaveBeenCalled();
    expect(mockEntities.Pickem.create).toHaveBeenCalled();
  });
});

describe('createUserPickemChoice - Nickname Locking', () => {
  const validArgs = {
    userId: 1,
    pickemChoiceId: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('allows user to choose any option if they have no nickname', async () => {
    const contextWithoutNickname = {
      ...mockContext,
      user: { ...mockContext.user, nickname: null }
    };

    mockEntities.PickemChoice.findUnique.mockResolvedValueOnce({
      id: 1,
      nickname: 'SOME_AGENT',
      pickem: { 
        id: 1,
        correctChoiceId: null,
        contest: { deadline: new Date('2100-01-01') },
        choices: []
      }
    });

    mockEntities.UserPickemChoice.findUnique.mockResolvedValueOnce(null);
    mockEntities.UserPickemChoice.findMany.mockResolvedValueOnce([]);

    await expect(createUserPickemChoice(validArgs, contextWithoutNickname))
      .resolves.toBeDefined();
  });

  test('allows user to choose their own prediction if it exists', async () => {
    mockEntities.PickemChoice.findUnique.mockResolvedValueOnce({
      id: 1,
      nickname: 'TEST_AGENT',
      pickem: { 
        id: 1,
        correctChoiceId: null,
        contest: { deadline: new Date('2100-01-01') },
        choices: [
          { id: 1, nickname: 'TEST_AGENT' }
        ]
      }
    });

    mockEntities.UserPickemChoice.findUnique.mockResolvedValueOnce(null);
    mockEntities.UserPickemChoice.findMany.mockResolvedValueOnce([{
      pickemChoice: {
        id: 1,
        pickem: {
          id: 1,
          correctChoiceId: null
        }
      }
    }]);

    const result = await createUserPickemChoice(validArgs, mockContext);
    expect(result).toBeDefined();
  });

  test('allows user to choose any option if they did not make a prediction', async () => {
    mockEntities.PickemChoice.findUnique.mockResolvedValueOnce({
      id: 1,
      nickname: 'OTHER_AGENT',
      pickem: { 
        id: 1,
        correctChoiceId: null,
        contest: { deadline: new Date('2100-01-01') },
        choices: [
          { id: 1, nickname: 'OTHER_AGENT' },
          { id: 2, nickname: 'ANOTHER_AGENT' }
        ]
      }
    });

    mockEntities.UserPickemChoice.findUnique.mockResolvedValueOnce(null);
    mockEntities.UserPickemChoice.findMany.mockResolvedValueOnce([{
      pickemChoice: {
        id: 1,
        pickem: {
          id: 1,
          correctChoiceId: null
        }
      }
    }]);

    const result = await createUserPickemChoice(validArgs, mockContext);
    expect(result).toBeDefined();
  });

  test('prevents user from choosing if they already made a choice', async () => {
    mockEntities.PickemChoice.findUnique.mockResolvedValueOnce({
      id: 1,
      nickname: 'OTHER_AGENT',
      pickem: { 
        id: 1,
        correctChoiceId: null,
        contest: { deadline: new Date('2100-01-01') }
      }
    });

    mockEntities.UserPickemChoice.findUnique.mockResolvedValueOnce({
      id: 1,
      userId: 1,
      pickemId: 1
    });

    await expect(createUserPickemChoice(validArgs, mockContext))
      .rejects.toThrow('User already has a choice for this pickem');
  });
});

describe('automateAllUserChoices', () => {
  const mockPickemChoices = [
    {
      id: 1,
      nickname: 'AGENT1',
      pickem: { id: 1 }
    },
    {
      id: 2,
      nickname: 'AGENT2',
      pickem: { id: 1 }
    },
    {
      id: 3,
      nickname: 'AGENT1',
      pickem: { id: 2 }
    }
  ];

  const mockUsers = [
    {
      id: 1,
      nickname: 'AGENT1'
    },
    {
      id: 2,
      nickname: 'AGENT2'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires admin access', async () => {
    await expect(automateAllUserChoices({}, mockContext))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  test('automates choices for existing users with matching nicknames', async () => {
    // Mock finding all choices with nicknames
    mockEntities.PickemChoice.findMany.mockResolvedValueOnce(mockPickemChoices);

    // Mock finding users by nickname
    mockEntities.User.findFirst
      .mockResolvedValueOnce(mockUsers[0]) // For AGENT1
      .mockResolvedValueOnce(mockUsers[1]); // For AGENT2

    // Mock checking for existing choices
    mockEntities.UserPickemChoice.findUnique
      .mockResolvedValue(null); // No existing choices

    const result = await automateAllUserChoices({}, adminContext);

    // Should create 3 UserPickemChoices (2 for AGENT1, 1 for AGENT2)
    expect(mockEntities.UserPickemChoice.create).toHaveBeenCalledTimes(3);
    expect(result.automatedCount).toBe(3);
  });

  test('skips existing user choices', async () => {
    // Mock finding all choices with nicknames
    mockEntities.PickemChoice.findMany.mockResolvedValueOnce(mockPickemChoices);

    // Mock finding users by nickname
    mockEntities.User.findFirst
      .mockResolvedValueOnce(mockUsers[0]) // For AGENT1
      .mockResolvedValueOnce(mockUsers[1]); // For AGENT2

    // Mock existing choices check - one choice already exists
    mockEntities.UserPickemChoice.findUnique
      .mockResolvedValueOnce({ id: 1 }) // Existing choice for first one
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const result = await automateAllUserChoices({}, adminContext);

    // Should only create 2 UserPickemChoices (skipping the existing one)
    expect(mockEntities.UserPickemChoice.create).toHaveBeenCalledTimes(2);
    expect(result.automatedCount).toBe(2);
  });

  test('handles users without matching nicknames', async () => {
    // Mock finding all choices with nicknames
    mockEntities.PickemChoice.findMany.mockResolvedValueOnce([
      {
        id: 1,
        nickname: 'NONEXISTENT',
        pickem: { id: 1 }
      }
    ]);

    // Mock no matching user found
    mockEntities.User.findFirst.mockResolvedValueOnce(null);

    const result = await automateAllUserChoices({}, adminContext);

    // Should not create any UserPickemChoices
    expect(mockEntities.UserPickemChoice.create).not.toHaveBeenCalled();
    expect(result.automatedCount).toBe(0);
  });

  test('handles empty choices list', async () => {
    // Mock finding no choices with nicknames
    mockEntities.PickemChoice.findMany.mockResolvedValueOnce([]);

    const result = await automateAllUserChoices({}, adminContext);

    // Should not create any UserPickemChoices
    expect(mockEntities.UserPickemChoice.create).not.toHaveBeenCalled();
    expect(result.automatedCount).toBe(0);
  });

  test('returns success message with count', async () => {
    // Mock finding choices with nicknames
    mockEntities.PickemChoice.findMany.mockResolvedValueOnce([mockPickemChoices[0]]);

    // Mock finding user by nickname
    mockEntities.User.findFirst.mockResolvedValueOnce(mockUsers[0]);

    // Mock no existing choice
    mockEntities.UserPickemChoice.findUnique.mockResolvedValueOnce(null);

    const result = await automateAllUserChoices({}, adminContext);

    expect(result).toEqual({
      success: true,
      automatedCount: 1,
      message: 'Successfully automated 1 user choices'
    });
  });

  test('handles database errors gracefully', async () => {
    // Mock database error
    mockEntities.PickemChoice.findMany.mockRejectedValueOnce(new Error('Database error'));

    await expect(automateAllUserChoices({}, adminContext))
      .rejects.toThrow();
  });
});

describe('createPickemWithPredefinedChoices', () => {
  const validArgs = {
    choices: [
      { text: 'Choice 1', nickname: 'AGENT1' },
      { text: 'Choice 2', nickname: 'AGENT2' }
    ],
    categoryId: 1,
    contestId: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires admin access', async () => {
    await expect(createPickemWithPredefinedChoices(validArgs, mockContext))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  test('requires either categoryId or categoryName', async () => {
    const args = { ...validArgs, categoryId: undefined };
    await expect(createPickemWithPredefinedChoices(args, adminContext))
      .rejects.toThrow('Either categoryId or categoryName must be provided');
  });

  test('validates choices format', async () => {
    const args = { ...validArgs, choices: 'invalid' };
    await expect(createPickemWithPredefinedChoices(args, adminContext))
      .rejects.toThrow('Choices must be an array');
  });

  test('creates pickem with choices and associates users', async () => {
    // Mock pickem creation
    mockEntities.Pickem.create.mockResolvedValueOnce({
      id: 1,
      choices: [
        { id: 1, nickname: 'AGENT1' },
        { id: 2, nickname: 'AGENT2' }
      ]
    });

    // Mock finding users by nickname
    mockEntities.User.findFirst
      .mockResolvedValueOnce({ id: 1, nickname: 'AGENT1' })
      .mockResolvedValueOnce({ id: 2, nickname: 'AGENT2' });

    const result = await createPickemWithPredefinedChoices(validArgs, adminContext);

    expect(mockEntities.Pickem.create).toHaveBeenCalled();
    expect(mockEntities.UserPickemChoice.create).toHaveBeenCalledTimes(2);
    expect(result).toBeDefined();
  });

  test('handles missing users gracefully', async () => {
    // Mock pickem creation
    mockEntities.Pickem.create.mockResolvedValueOnce({
      id: 1,
      choices: [
        { id: 1, nickname: 'AGENT1' },
        { id: 2, nickname: 'NONEXISTENT' }
      ]
    });

    // Mock finding users - one exists, one doesn't
    mockEntities.User.findFirst
      .mockResolvedValueOnce({ id: 1, nickname: 'AGENT1' })
      .mockResolvedValueOnce(null);

    const result = await createPickemWithPredefinedChoices(validArgs, adminContext);

    // Should only create one UserPickemChoice for the existing user
    expect(mockEntities.UserPickemChoice.create).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });
}); 