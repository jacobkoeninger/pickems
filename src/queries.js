import { HttpError } from 'wasp/server'

export const getOpenPickems = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }
  return context.entities.Pickem.findMany({
    where: { correctChoiceId: null },
    include: { choices: true }
  });
}
export const getPickemChoices = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }
  return context.entities.PickemChoice.findMany({
    include: {
      pickem: true
    }
  });
}

export const getUserPickemChoices = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }
  return context.entities.UserPickemChoice.findMany({
    where: {
      userId: context.user.id
    },
    include: {
      pickemChoice: true
    }
  });
}
export const getContests = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }
  return context.entities.Contest.findMany({
    include: {
      pickems: {
        include: {
          choices: true
        }
      }
    }
  });
}

export const getCategories = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }
  return context.entities.PickemCategory.findMany();
}
