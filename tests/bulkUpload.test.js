/**
 * @jest-environment node
 */

import { bulkCreatePickems } from '../src/actions';
import { HttpError } from 'wasp/server';

const createMockContext = () => ({
  user: { id: 'user1', isAdmin: true },
  entities: {
    PickemCategory: {
      findFirst: jest.fn(),
      create: jest.fn()
    },
    Pickem: {
      create: jest.fn()
    }
  }
});

describe('bulkCreatePickems', () => {
  let context;

  beforeEach(() => {
    context = createMockContext();
  });

  it('should throw error if user is not admin', async () => {
    context.user.isAdmin = false;
    await expect(bulkCreatePickems([], context)).rejects.toThrow(HttpError);
  });

  it('should throw error if pickems is not in correct format', async () => {
    await expect(bulkCreatePickems({ pickems: {} }, context)).rejects.toThrow('Invalid pickems format');
  });

  it('should handle empty array of pickems', async () => {
    const result = await bulkCreatePickems({ contestId: 1, pickems: [] }, context);
    expect(result).toEqual([]);
  });

  it('should create pickems with valid data', async () => {
    const mockData = {
      contestId: 1,
      pickems: [
        {
          category: 'Test Category',
          prediction1: { text: 'Choice 1', owner: 'JK' },
          prediction2: { text: 'Choice 2', owner: null }
        }
      ]
    };

    context.entities.PickemCategory.findFirst.mockResolvedValue({
      id: 'category1',
      name: 'Test Category'
    });

    context.entities.Pickem.create.mockResolvedValue({
      id: 'pickem1',
      category: { id: 'category1', name: 'Test Category' },
      choices: [
        { id: 'choice1', text: 'Choice 1', owner: 'JK' },
        { id: 'choice2', text: 'Choice 2', owner: null }
      ]
    });

    const result = await bulkCreatePickems(mockData, context);
    expect(result).toHaveLength(1);
    expect(result[0].choices).toHaveLength(2);
  });

  it('should create new category if it does not exist', async () => {
    const mockData = {
      contestId: 1,
      pickems: [{
        category: 'New Category',
        prediction1: { text: 'Choice 1', owner: 'JK' },
        prediction2: { text: 'Choice 2', owner: null }
      }]
    };

    context.entities.PickemCategory.findFirst.mockResolvedValue(null);
    context.entities.PickemCategory.create.mockResolvedValue({
      id: 'newCategory1',
      name: 'New Category'
    });

    await bulkCreatePickems(mockData, context);
    expect(context.entities.PickemCategory.create).toHaveBeenCalled();
  });

  it('should validate required fields in pickem data', async () => {
    const invalidData = {
      contestId: 1,
      pickems: [{
        // Missing required fields
        category: 'Test Category'
      }]
    };

    await expect(bulkCreatePickems(invalidData, context))
      .rejects
      .toThrow('Invalid pickem data');
  });
}); 