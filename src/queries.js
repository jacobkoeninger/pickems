import { HttpError } from 'wasp/server'

export const getOpenPickems = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }
  return context.entities.Pickem.findMany({
    where: { correctChoiceId: null },
    include: { 
      category: true,
      choices: {
        select: {
          id: true,
          text: true,
          description: true,
          nickname: true,
          userChoices: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  nickname: true,
                  avatarUrl: true
                }
              }
            }
          }
        }
      }
    }
  });
}

export const getPickemChoices = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }
  return context.entities.PickemChoice.findMany({
    include: {
      pickem: true,
      userChoices: {
        select: {
          id: true,
          userId: true,
          user: {
            select: {
              id: true,
              username: true,
              nickname: true,
              avatarUrl: true
            }
          }
        }
      }
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

export const getUserContests = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }
  return context.entities.Contest.findMany({
    where: {
      pickems: {
        some: {
          choices: {
            some: {
              userChoices: {
                some: {
                  userId: context.user.id
                }
              }
            }
          }
        }
      }
    },
    include: {
      pickems: {
        include: {
          choices: true
        }
      }
    }
  });
}

export const getUserContestPoints = async ({ contestId }, context) => {
  if (!context.user) { throw new HttpError(401) }
  const userChoices = await context.entities.UserPickemChoice.findMany({
    where: {
      userId: context.user.id,
      pickemChoice: {
        pickem: {
          contestId
        }
      }
    },
    include: {
      pickemChoice: {
        include: {
          pickem: true
        }
      }
    }
  });

  return userChoices.reduce((total, choice) => {
    if (choice.pickemChoice.id === choice.pickemChoice.pickem.correctChoiceId) {
      return total + 1;
    }
    return total;
  }, 0);
}

export const getUserContestCorrectPicks = async ({ contestId }, context) => {
  if (!context.user) { throw new HttpError(401) }
  return context.entities.UserPickemChoice.count({
    where: {
      userId: context.user.id,
      pickemChoice: {
        pickem: {
          contestId,
          correctChoiceId: {
            equals: context.entities.Prisma.raw('pickemChoice.id')
          }
        }
      }
    }
  });
}

export const getUserContestIncorrectPicks = async ({ contestId }, context) => {
  if (!context.user) { throw new HttpError(401) }
  return context.entities.UserPickemChoice.count({
    where: {
      userId: context.user.id,
      pickemChoice: {
        pickem: {
          contestId,
          correctChoiceId: {
            not: context.entities.Prisma.raw('pickemChoice.id'),
            not: null
          }
        }
      }
    }
  });
}

export const getContests = async (args, context) => {
  if (!context.user) { throw new HttpError(401) }
  return context.entities.Contest.findMany({
    include: {
      pickems: {
        include: {
          category: true,
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

export const getLeaderboard = async (args, context) => {
  const users = await context.entities.User.findMany({
    where: {
      points: {
        gt: 0
      }
    },
    orderBy: {
      points: 'desc'
    },
    take: 100,
    select: {
      id: true,
      username: true,
      nickname: true,
      points: true,
      avatarUrl: true,
      userPickemChoices: {
        include: {
          pickemChoice: {
            include: {
              pickem: {
                select: {
                  correctChoiceId: true
                }
              }
            }
          }
        }
      }
    }
  });

  return users.map(user => {
    const totalPicks = user.userPickemChoices.length;
    const correctPicks = user.userPickemChoices.filter(pick => 
      pick.pickemChoice.pickem.correctChoiceId === pick.pickemChoice.id
    ).length;
    
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      points: user.points,
      avatarUrl: user.avatarUrl,
      totalPicks,
      correctPicks
    };
  });
}

export const getPickemById = async ({ pickemId }, context) => {
  if (!context.user) { throw new HttpError(401) }
  
  return context.entities.Pickem.findUnique({
    where: { id: pickemId },
    include: {
      category: true,
      choices: {
        select: {
          id: true,
          text: true,
          description: true,
          nickname: true,
          userChoices: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  nickname: true,
                  avatarUrl: true
                }
              }
            }
          }
        }
      }
    }
  });
}
