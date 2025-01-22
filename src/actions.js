import { HttpError } from 'wasp/server'

export const createContest = async ({ name, description }, context) => {
  if (!context.user) { throw new HttpError(401) }
  if (!context.user.isAdmin) { throw new HttpError(403, 'Only admins can create contests') }

  const contest = await context.entities.Contest.create({
    data: {
      name,
      description: description || null
    }
  })

  return contest
}

export const updateUser = async ({ username }, context) => {
  if (!context.user) { throw new HttpError(401) }
  await context.entities.User.update({
    where: { id: context.user.id },
    data: { username }
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
          owner: {
            connect: { id: context.user.id }
          }
        }))
      }
    },
    include: {
      choices: true
    }
  })

  return pickem
}

export const updatePickemChoiceOwner = async ({ pickemChoiceId, newOwnerId }, context) => {
  if (!context.user) { throw new HttpError(401) }
  if (!context.user.isAdmin) { throw new HttpError(403, 'Only admins can update choice owners') }

  const pickemChoice = await context.entities.PickemChoice.findUnique({
    where: { id: pickemChoiceId },
    include: { pickem: true }
  })
  if (!pickemChoice) { throw new HttpError(404, 'Choice not found') }
  if (pickemChoice.pickem.correctChoiceId) { throw new HttpError(400, 'Cannot update owner of choice in closed pickem') }

  const updatedChoice = await context.entities.PickemChoice.update({
    where: { id: pickemChoiceId },
    data: {
      owner: {
        connect: { id: newOwnerId }
      }
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
  if (!context.user) { throw new HttpError(403) }

  const pickem = await context.entities.Pickem.findUnique({
    where: { id: pickemId },
    include: { choices: true }
  })
  if (!pickem) { throw new HttpError(404, 'Pickem not found') }

  if (pickem.correctChoiceId) { throw new HttpError(400, 'Pickem is already closed') }

  const correctChoice = pickem.choices.find(choice => choice.id === correctChoiceId)
  if (!correctChoice) { throw new HttpError(400, 'Invalid correct choice') }

  const incorrectChoices = pickem.choices.filter(choice => choice.id !== correctChoiceId)
  const incorrectUserChoices = await context.entities.UserPickemChoice.findMany({
    where: { pickemChoiceId: { in: incorrectChoices.map(choice => choice.id) } }
  })

  const correctUserChoices = await context.entities.UserPickemChoice.findMany({
    where: { pickemChoiceId: correctChoiceId }
  })

  const pointsToDistribute = incorrectUserChoices.length

  for (const userChoice of correctUserChoices) {
    await context.entities.User.update({
      where: { id: userChoice.userId },
      data: { points: { increment: pointsToDistribute } }
    })
  }

  await context.entities.Pickem.update({
    where: { id: pickemId },
    data: { correctChoiceId: correctChoiceId }
  })
}

export const bulkCreatePickems = async (pickems, context) => {
  if (!context.user?.isAdmin) { throw new HttpError(403) }

  const createdPickems = []

  for (const pickem of pickems) {
    // Create the choices first
    const choices = []
    
    if (pickem.prediction1) {
      choices.push({
        text: pickem.prediction1.text,
        owner: pickem.prediction1.ownerId ? {
          connect: { id: pickem.prediction1.ownerId }
        } : undefined
      })
    }

    if (pickem.prediction2) {
      choices.push({
        text: pickem.prediction2.text,
        owner: pickem.prediction2.ownerId ? {
          connect: { id: pickem.prediction2.ownerId }
        } : undefined
      })
    }

    // Find or create the category
    let category = await context.entities.PickemCategory.findFirst({
      where: {
        name: pickem.category
      }
    })

    if (!category) {
      category = await context.entities.PickemCategory.create({
        data: {
          name: pickem.category
        }
      })
    }

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
            id: pickem.contestId
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
    })

    createdPickems.push(created)
  }

  return createdPickems
}
