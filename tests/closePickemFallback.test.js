/**
 * @jest-environment node
 */

import { closePickem } from '../src/actions';
import { HttpError } from 'wasp/server';

// Create a mock context without the UserPickemChoice entity
const createMockContextWithoutUPC = () => ({
  user: { id: 'admin1', isAdmin: true },
  entities: {
    Pickem: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    // Intentionally not providing UserPickemChoice to simulate missing property
    User: {
      update: jest.fn(),
    }
  }
});

describe('closePickem fallback behavior when UserPickemChoice is missing', () => {
  it('should update pickem without awarding any points when UserPickemChoice is missing', async () => {
    const context = createMockContextWithoutUPC();
    
    // Setup a mock pickem with choices
    const mockPickem = {
      id: 'pickem1',
      choices: [
        { id: 'choiceA' },
        { id: 'choiceB' }
      ],
      correctChoiceId: null
    };
    
    // Mock Pickem.findUnique to return the mock pickem
    context.entities.Pickem.findUnique.mockResolvedValue(mockPickem);
    
    // Execute closePickem with the correct choice set to 'choiceA'
    await closePickem({ pickemId: 'pickem1', correctChoiceId: 'choiceA' }, context);
    
    // Verify that Pickem.update was called to update the correctChoiceId
    expect(context.entities.Pickem.update).toHaveBeenCalledWith({
      where: { id: 'pickem1' },
      data: { correctChoiceId: 'choiceA' }
    });
    
    // Since fallback returns empty array, User.update should not be called for awarding points
    expect(context.entities.User.update).not.toHaveBeenCalled();
  });

  it('should throw an error if pickem is not found even with fallback', async () => {
    const context = createMockContextWithoutUPC();
    // Ensure findUnique returns null
    context.entities.Pickem.findUnique.mockResolvedValue(null);
    
    await expect(
      closePickem({ pickemId: 'nonexistent', correctChoiceId: 'choiceX' }, context)
    ).rejects.toThrow(HttpError);
  });
}); 