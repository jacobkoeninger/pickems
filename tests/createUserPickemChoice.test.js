/**
 * @jest-environment node
 */

import { createUserPickemChoice } from '../src/actions';
import { HttpError } from 'wasp/server';

// Create a mock context for testing
const createMockContext = () => ({
  user: { id: 'user1' },
  entities: {
    PickemChoice: {
      findUnique: jest.fn(),
    },
    UserPickemChoice: {
      create: jest.fn(),
    },
  },
});

describe('createUserPickemChoice', () => {
  it('should throw an error if the contest deadline has passed', async () => {
    const context = createMockContext();
    const pastDate = new Date(Date.now() - 10000); // 10 seconds in the past

    // Setting up the mock for PickemChoice.findUnique
    context.entities.PickemChoice.findUnique.mockResolvedValue({
      id: 'choice1',
      pickem: {
        id: 'pickem1',
        contest: {
          deadline: pastDate
        },
        correctChoiceId: null
      }
    });

    await expect(
      createUserPickemChoice({ userId: 'user1', pickemChoiceId: 'choice1' }, context)
    ).rejects.toThrow('Contest deadline has passed');
  });
}); 