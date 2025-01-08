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

export const createPickem = async ({ choices, categoryId, contestId }, context) => {
  if (!context.user) { throw new HttpError(401) }

  const pickem = await context.entities.Pickem.create({
    data: {
      category: {
        connect: { id: categoryId }
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


export const createUserPickemChoice = async ({ userId, pickemChoiceId }, context) => {
  if (!context.user) { throw new HttpError(401) }
  if (context.user.id !== userId) { throw new HttpError(403) }

  const pickemChoice = await context.entities.PickemChoice.findUnique({
    where: { id: pickemChoiceId },
    include: { pickem: true }
  })
  if (!pickemChoice) { throw new HttpError(404, 'Choice not found') }
  if (pickemChoice.pickem.correctChoiceId) { throw new HttpError(400, 'Pickem is already closed') }

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
