import { HttpError } from 'wasp/server'

/**
 * Deletes a contest and all its associated pickems.
 *
 * @param {Object} args - The contest details.
 * @param {string} args.contestId - The ID of the contest to delete.
 * @param {Object} context - Contains user information and database entities.
 * @throws {HttpError} If the user is not authenticated or is not an admin.
 * @returns {Promise<void>}
 */
export const deleteContest = async ({ contestId }, context) => {
  if (!context.user) { throw new HttpError(401) }
  if (!context.user.isAdmin) { throw new HttpError(403, 'Only admins can delete contests') }

  // Delete all associated user choices first
  await context.entities.UserPickemChoice.deleteMany({
    where: {
      pickem: {
        contestId
      }
    }
  });

  // Delete all pickem choices
  await context.entities.PickemChoice.deleteMany({
    where: {
      pickem: {
        contestId
      }
    }
  });

  // Delete all pickems associated with the contest
  await context.entities.Pickem.deleteMany({
    where: { contestId }
  });

  // Finally delete the contest
  await context.entities.Contest.delete({
    where: { id: contestId }
  });
}

/**
 * Creates a new contest.
 *
 * @param {Object} args - The contest details.
 * @param {string} args.name - The name of the contest.
 * @param {string} [args.description] - A description for the contest.
 * @param {string|Date} [args.deadline] - The contest deadline.
 * @param {Object} context - Contains user information and database entities.
 * @throws {HttpError} If the user is not authenticated or is not an admin.
 * @returns {Promise<Object>} The newly created contest object.
 */
export const createContest = async ({ name, description, deadline }, context) => {
  if (!context.user) { throw new HttpError(401) }
  if (!context.user.isAdmin) { throw new HttpError(403, 'Only admins can create contests') }

  const contest = await context.entities.Contest.create({
    data: {
      name,
      description: description || null,
      deadline: deadline ? new Date(deadline) : null
    }
  })

  return contest
}

export const updateUser = async ({ username, nickname }, context) => {
  if (!context.user) { throw new HttpError(401) }

  // Validate username
  if (!username) {
    throw new HttpError(400, 'Username is required')
  }
  if (username.length < 3) {
    throw new HttpError(400, 'Username must be at least 3 characters long')
  }

  // Check if username is taken (if it's different from current)
  if (username !== context.user.username) {
    const existingUser = await context.entities.User.findUnique({
      where: { username }
    })
    if (existingUser) {
      throw new HttpError(400, 'Username is already taken')
    }
  }

  // Check if nickname is taken (if provided and different from current)
  if (nickname && nickname !== context.user.nickname) {
    const existingNickname = await context.entities.User.findUnique({
      where: { nickname }
    })
    if (existingNickname) {
      throw new HttpError(400, 'Nickname is already taken')
    }
  }

  // Update user
  await context.entities.User.update({
    where: { id: context.user.id },
    data: {
      username,
      nickname: nickname || null // Set to null if empty string
    }
  })
}

export const createPickem = async ({ choices, categoryId, categoryName, contestId }, context) => {
  if (!context.user) { throw new HttpError(401) }

  const categoryConnect = {}
  if (categoryId) {
    categoryConnect.id = categoryId
  } else if (categoryName) {
    categoryConnect.name = categoryName
  } else {
    throw new HttpError(400, 'Either categoryId or categoryName must be provided')
  }

  const pickem = await context.entities.Pickem.create({
    data: {
      category: {
        connect: categoryConnect
      },
      contest: {
        connect: { id: contestId }
      },
      choices: {
        create: choices.map(text => ({
          text,
          nickname: context.user.nickname
        }))
      }
    },
    include: {
      choices: true
    }
  })

  // Create UserPickemChoice for the user's own choice
  if (context.user.nickname) {
    const userChoice = pickem.choices.find(choice => choice.nickname === context.user.nickname)
    if (userChoice) {
      await context.entities.UserPickemChoice.create({
        data: {
          userId: context.user.id,
          pickemChoiceId: userChoice.id,
          pickemId: pickem.id
        }
      })
    }
  }

  return pickem
}

export const updatePickemChoiceOwner = async ({ pickemChoiceId, newOwnerId, newNicknameId }, context) => {
  if (!context.user) { throw new HttpError(401) }
  if (!context.user.isAdmin) { throw new HttpError(403, 'Only admins can update choice owners') }

  const pickemChoice = await context.entities.PickemChoice.findUnique({
    where: { id: pickemChoiceId },
    include: { pickem: true }
  })
  if (!pickemChoice) { throw new HttpError(404, 'Choice not found') }
  if (pickemChoice.pickem.correctChoiceId) { throw new HttpError(400, 'Cannot update owner of choice in closed pickem') }

  const updateData = {}
  
  if (newOwnerId) {
    updateData.owner = {
      connect: { id: newOwnerId }
    }
  }

  if (newNicknameId) {
    updateData.nicknameUser = {
      connect: { id: newNicknameId }
    }
  }

  const updatedChoice = await context.entities.PickemChoice.update({
    where: { id: pickemChoiceId },
    data: updateData,
    include: {
      owner: true,
      nicknameUser: true
    }
  })

  return updatedChoice
}

export const createUserPickemChoice = async ({ userId, pickemChoiceId }, context) => {
  if (!context.user) { throw new HttpError(401) }
  if (context.user.id !== userId) { throw new HttpError(403) }

  const pickemChoice = await context.entities.PickemChoice.findUnique({
    where: { id: pickemChoiceId },
    include: { 
      pickem: {
        include: {
          contest: true
        }
      }
    }
  })
  if (!pickemChoice) { throw new HttpError(404, 'Choice not found') }
  if (pickemChoice.pickem.correctChoiceId) { throw new HttpError(400, 'Pickem is already closed') }

  // Check if contest deadline has passed
  if (pickemChoice.pickem.contest.deadline < new Date()) {
    throw new HttpError(400, 'Contest deadline has passed')
  }

  const userPickemChoice = await context.entities.UserPickemChoice.create({
    data: {
      user: {
        connect: { id: userId }
      },
      pickemChoice: {
        connect: { id: pickemChoiceId }
      },
      pickem: {
        connect: { id: pickemChoice.pickem.id }
      }
    }
  })
  return userPickemChoice
}

export const closePickem = async ({ pickemId, correctChoiceId }, context) => {
  if (!context.user) { throw new HttpError(403); }

  // Use fallback for UserPickemChoice if not defined
  const userPickemChoiceEntity = (context.entities && context.entities.UserPickemChoice) || { findMany: async () => [] };

  const pickem = await context.entities.Pickem.findUnique({
    where: { id: pickemId },
    include: { choices: true }
  });
  if (!pickem) { throw new HttpError(404, 'Pickem not found'); }

  if (pickem.correctChoiceId) { throw new HttpError(400, 'Pickem is already closed'); }

  const correctChoice = pickem.choices.find(choice => choice.id === correctChoiceId);
  if (!correctChoice) { throw new HttpError(400, 'Invalid correct choice'); }

  const incorrectChoices = pickem.choices.filter(choice => choice.id !== correctChoiceId);

  const incorrectUserChoices = await userPickemChoiceEntity.findMany({
    where: { pickemChoiceId: { in: incorrectChoices.map(choice => choice.id) } }
  });

  const correctUserChoices = await userPickemChoiceEntity.findMany({
    where: { pickemChoiceId: correctChoiceId }
  });

  const pointsToDistribute = incorrectUserChoices.length;
  console.log(`Scoring logic: Calculated pointsToDistribute as ${pointsToDistribute} based on ${incorrectUserChoices.length} incorrect choices.`);

  for (const userChoice of correctUserChoices) {
    await context.entities.User.update({
      where: { id: userChoice.userId },
      data: { points: { increment: pointsToDistribute } }
    });
  }

  await context.entities.Pickem.update({
    where: { id: pickemId },
    data: { correctChoiceId: correctChoiceId }
  });
};

export const bulkCreatePickems = async (data, context) => {
  if (!context.user?.isAdmin) { throw new HttpError(403) }

  // Validate input format
  if (!data || !Array.isArray(data.pickems)) {
    throw new Error('Invalid pickems format');
  }

  if (!data.contestId) {
    throw new Error('Contest ID is required');
  }

  // Verify contest exists
  const contest = await context.entities.Contest.findUnique({
    where: { id: parseInt(data.contestId) }
  });

  if (!contest) {
    throw new Error(`Contest with ID ${data.contestId} not found`);
  }

  const createdPickems = [];
  // Cache for categories to avoid multiple DB lookups
  const categoryCache = new Map();

  for (const pickem of data.pickems) {
    try {
      // Validate required fields
      if (!pickem.category || !pickem.prediction1?.text || !pickem.prediction2?.text) {
        throw new Error('Invalid pickem data: missing required fields');
      }

      // Get or create category using cache
      let category;
      if (categoryCache.has(pickem.category)) {
        category = categoryCache.get(pickem.category);
      } else {
        // Try to find existing category
        category = await context.entities.PickemCategory.findFirst({
          where: { name: pickem.category }
        });

        // Create category if it doesn't exist
        if (!category) {
          console.log(`Creating new category: ${pickem.category}`);
          category = await context.entities.PickemCategory.create({
            data: {
              name: pickem.category,
              description: null, // Can be updated later if needed
              isActive: true
            }
          });
        }

        // Add to cache
        categoryCache.set(pickem.category, category);
      }

      if (!category) {
        throw new Error(`Failed to create/find category: ${pickem.category}`);
      }

      // Create the choices array
      const choices = [
        {
          text: pickem.prediction1.text,
          nickname: pickem.prediction1.owner
        },
        {
          text: pickem.prediction2.text,
          nickname: pickem.prediction2.owner
        }
      ];

      // Create the pickem with its choices
      const created = await context.entities.Pickem.create({
        data: {
          category: {
            connect: {
              id: category.id
            }
          },
          contest: {
            connect: {
              id: parseInt(data.contestId)
            }
          },
          choices: {
            create: choices
          }
        },
        include: {
          choices: true,
          category: true,
          contest: true
        }
      });

      console.log(`Created pickem in category '${category.name}' with ID: ${created.id}`);
      createdPickems.push(created);
    } catch (error) {
      console.error(`Error creating pickem: ${error.message}`, {
        category: pickem.category,
        prediction1: pickem.prediction1.text,
        prediction2: pickem.prediction2.text
      });
      throw error; // Re-throw to handle at higher level
    }
  }

  return createdPickems;
};
