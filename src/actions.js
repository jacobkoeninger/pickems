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

// Add this helper function
const updateUserStats = async (userId, context) => {
  const userStats = await context.entities.UserPickemChoice.findMany({
    where: {
      userId,
    },
    include: {
      pickemChoice: {
        include: {
          pickem: true
        }
      }
    }
  });

  const totalPicks = userStats.length;
  const correctPicks = userStats.filter(pick => 
    pick.pickemChoice.pickem.correctChoiceId === pick.pickemChoice.id
  ).length;
  const successRate = totalPicks > 0 ? (correctPicks / totalPicks) : 0;

  await context.entities.User.update({
    where: { id: userId },
    data: {
      totalPicks,
      correctPicks,
      successRate,
      lastPickAt: new Date()
    }
  });
};

export const createUserPickemChoice = async ({ userId, pickemChoiceId }, context) => {
  if (!context.user) { throw new HttpError(401) }
  if (context.user.id !== userId) { throw new HttpError(403) }

  const pickemChoice = await context.entities.PickemChoice.findUnique({
    where: { id: pickemChoiceId },
    include: { 
      pickem: {
        include: {
          contest: true,
          choices: true
        }
      }
    }
  });

  if (!pickemChoice) { throw new HttpError(404, 'Choice not found') }
  if (pickemChoice.pickem.correctChoiceId) { throw new HttpError(400, 'Pickem is already closed') }

  // Check if contest deadline has passed
  if (pickemChoice.pickem.contest.deadline < new Date()) {
    throw new HttpError(400, 'Contest deadline has passed')
  }

  // Check if user already has a choice for this pickem
  const existingChoice = await context.entities.UserPickemChoice.findUnique({
    where: {
      userId_pickemId: {
        userId,
        pickemId: pickemChoice.pickem.id
      }
    }
  });

  if (existingChoice) {
    throw new HttpError(400, 'User already has a choice for this pickem')
  }

  // If the user has a nickname, check if they made a prediction
  if (context.user.nickname) {
    const userPrediction = pickemChoice.pickem.choices.find(choice => 
      choice.nickname === context.user.nickname
    );

    // If user made a prediction but is trying to choose a different option
    if (userPrediction && userPrediction.id !== pickemChoiceId) {
      throw new HttpError(400, 'You must choose your own prediction')
    }
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
  });

  // Update user stats after creating the choice
  await updateUserStats(userId, context);

  // Return the updated user stats along with the choice
  const updatedUser = await context.entities.User.findUnique({
    where: { id: userId },
    select: {
      points: true,
      totalPicks: true,
      correctPicks: true,
      successRate: true,
      lastPickAt: true
    }
  });

  return {
    userPickemChoice,
    userStats: updatedUser
  };
};

export const closePickem = async ({ pickemId, correctChoiceId }, context) => {
  if (!context.user) { throw new HttpError(401) }

  const pickem = await context.entities.Pickem.findUnique({
    where: { id: pickemId },
    include: {
      contest: true,
      choices: {
        include: {
          userChoices: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });

  if (!pickem) { throw new HttpError(404, 'Pickem not found') }
  if (pickem.correctChoiceId) { throw new HttpError(400, 'Pickem is already closed') }
  if (!pickem.contest.isAdmin(context.user.id)) { throw new HttpError(403) }

  // Verify correctChoiceId is valid
  const correctChoice = pickem.choices.find(choice => choice.id === correctChoiceId);
  if (!correctChoice) { throw new HttpError(400, 'Invalid correct choice') }

  // Update pickem with correct choice
  await context.entities.Pickem.update({
    where: { id: pickemId },
    data: { correctChoiceId }
  });

  // Process all user choices and update points
  const affectedUsers = new Set();
  
  for (const choice of pickem.choices) {
    for (const userChoice of choice.userChoices) {
      if (!userChoice.user) continue;
      
      affectedUsers.add(userChoice.user.id);
      
      if (choice.id === correctChoiceId) {
        await context.entities.User.update({
          where: { id: userChoice.user.id },
          data: {
            points: { increment: 1 }
          }
        });
      }
    }
  }

  // Update stats for all affected users
  const updatedStats = [];
  for (const userId of affectedUsers) {
    const stats = await updateUserStats(userId, context);
    updatedStats.push(stats);
  }

  return {
    pickem,
    updatedUserStats: updatedStats
  };
};

// Helper function to automate user choices based on nicknames
const automateUserChoices = async (context) => {
  // Find all PickemChoices with nicknames that don't have corresponding UserPickemChoices
  const choices = await context.entities.PickemChoice.findMany({
    where: {
      nickname: { not: null }
    },
    include: {
      pickem: true
    }
  });

  let automatedCount = 0;
  
  // Group choices by nickname for efficiency
  const choicesByNickname = choices.reduce((acc, choice) => {
    if (!choice.nickname) return acc;
    if (!acc[choice.nickname]) acc[choice.nickname] = [];
    acc[choice.nickname].push(choice);
    return acc;
  }, {});

  // For each nickname, find the user and create their choices
  for (const [nickname, nicknameChoices] of Object.entries(choicesByNickname)) {
    const user = await context.entities.User.findFirst({
      where: { nickname }
    });

    if (user) {
      for (const choice of nicknameChoices) {
        // Check if UserPickemChoice already exists
        const existingChoice = await context.entities.UserPickemChoice.findUnique({
          where: {
            userId_pickemId: {
              userId: user.id,
              pickemId: choice.pickem.id
            }
          }
        });

        if (!existingChoice) {
          await context.entities.UserPickemChoice.create({
            data: {
              userId: user.id,
              pickemChoiceId: choice.id,
              pickemId: choice.pickem.id
            }
          });
          automatedCount++;
        }
      }
    }
  }

  return automatedCount;
};

export const automateAllUserChoices = async (args, context) => {
  if (!context.user?.isAdmin) { throw new HttpError(403) }
  
  const automatedCount = await automateUserChoices(context);
  
  return {
    success: true,
    automatedCount,
    message: `Successfully automated ${automatedCount} user choices`
  };
};

export const bulkCreatePickems = async (data, context) => {
  if (!context.user?.isAdmin) { throw new HttpError(403) }

  // Validate input format
  if (!data || !Array.isArray(data.pickems)) {
    throw new Error('Invalid pickems format');
  }

  // Add size limits for production safety
  const MAX_BULK_SIZE = process.env.MAX_BULK_SIZE ? parseInt(process.env.MAX_BULK_SIZE) : 100;
  if (data.pickems.length > MAX_BULK_SIZE) {
    throw new Error(`Bulk upload limited to ${MAX_BULK_SIZE} items at a time`);
  }

  if (!data.contestId) {
    throw new Error('Contest ID is required');
  }

  // Verify contest exists and is active
  const contest = await context.entities.Contest.findUnique({
    where: { id: parseInt(data.contestId) }
  });

  if (!contest) {
    throw new Error(`Contest with ID ${data.contestId} not found`);
  }

  if (!contest.isActive) {
    throw new Error('Cannot add pickems to inactive contest');
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

  // After creating all pickems, automate user choices
  const automatedCount = await automateUserChoices(context);
  console.log(`Automated ${automatedCount} user choices after bulk upload`);

  return {
    createdPickems,
    automatedCount
  };
};

export const updatePickem = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized')
  }

  const { id, choices } = args

  // Verify the pickem exists and user has permission to edit it
  const pickem = await context.entities.Pickem.findUnique({
    where: { id },
    include: {
      choices: true,
      contest: true
    }
  })

  if (!pickem) {
    throw new HttpError(404, 'Pickem not found')
  }

  // Only allow updates if user is admin
  if (!context.user.isAdmin) {
    throw new HttpError(403, 'Only admins can update pickems')
  }

  // Update each choice text while preserving nicknames
  for (const choice of choices) {
    await context.entities.PickemChoice.update({
      where: { id: choice.id },
      data: {
        text: choice.text
      }
    })
  }

  return {
    success: true,
    message: 'Pickem updated successfully'
  }
}

export const createPickemWithPredefinedChoices = async ({ choices, categoryId, categoryName, contestId }, context) => {
  if (!context.user?.isAdmin) { throw new HttpError(403) }

  const categoryConnect = {}
  if (categoryId) {
    categoryConnect.id = categoryId
  } else if (categoryName) {
    categoryConnect.name = categoryName
  } else {
    throw new HttpError(400, 'Either categoryId or categoryName must be provided')
  }

  // Validate choices format
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new HttpError(400, 'Choices must be an array of {text, nickname} objects')
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
        create: choices.map(({ text, nickname }) => ({
          text,
          nickname
        }))
      }
    },
    include: {
      choices: true
    }
  })

  // For each choice with a nickname, try to find the user and create their UserPickemChoice
  for (const choice of pickem.choices) {
    if (choice.nickname) {
      const user = await context.entities.User.findFirst({
        where: { nickname: choice.nickname }
      })
      
      if (user) {
        await context.entities.UserPickemChoice.create({
          data: {
            userId: user.id,
            pickemChoiceId: choice.id,
            pickemId: pickem.id
          }
        })
      }
    }
  }

  return pickem
}
