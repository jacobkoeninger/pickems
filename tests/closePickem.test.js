/**
 * @jest-environment node
 */

import { closePickem } from '../src/actions';
import { HttpError } from 'wasp/server';

// Create mocks for the context and its entities
const createMockContext = () => ({
  user: { id: 'user1', isAdmin: true },
  entities: {
    Pickem: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    UserPickemChoice: {
      findMany: jest.fn(),
    },
    User: {
      update: jest.fn(),
    },
  },
});

describe('closePickem', () => {
  let context;

  beforeEach(() => {
    context = createMockContext();
  });

  it('should throw error if user is not provided', async () => {
    await expect(closePickem({ pickemId: 'id', correctChoiceId: 'c1' }, {})).rejects.toThrow();
  });

  it('should throw error if pickem is not found', async () => {
    context.entities.Pickem.findUnique.mockResolvedValue(null);
    await expect(closePickem({ pickemId: 'invalid', correctChoiceId: 'c1' }, context)).rejects.toThrow(HttpError);
  });

  it('should update user points for correct choices', async () => {
    // Setup a mock pickem with choices
    const mockPickem = {
      id: 'pickem1',
      choices: [
        { id: 'choice1' },
        { id: 'choice2' }
      ],
      correctChoiceId: null,
      contest: { deadline: new Date(Date.now() + 10000) } // deadline in the future
    };

    // Assume correctChoice is first choice
    context.entities.Pickem.findUnique.mockResolvedValue(mockPickem);
    
    // Mock user choices: assume 2 incorrect choices and 1 correct choice
    context.entities.UserPickemChoice.findMany
      .mockResolvedValueOnce([ { userId: 'user2' }, { userId: 'user3' } ]) // incorrect choices
      .mockResolvedValueOnce([ { userId: 'user1' } ]); // correct choices

    await closePickem({ pickemId: 'pickem1', correctChoiceId: 'choice1' }, context);

    // Verify that User.update is called with the correct increment (2 points, from 2 incorrect choices)
    expect(context.entities.User.update).toHaveBeenCalledWith({
      where: { id: 'user1' },
      data: { points: { increment: 2 } }
    });

    // Verify that the pickem is updated to have the correctChoiceId set
    expect(context.entities.Pickem.update).toHaveBeenCalledWith({
      where: { id: 'pickem1' },
      data: { correctChoiceId: 'choice1' }
    });
  });
}); 