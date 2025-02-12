// Map of display names to nicknames
export const nicknameMap = {
  'losty': 'JK',
  '_jmf': 'JF',
  'n8': 'N8',
  'theherobiscuit': 'DG'
}

export const setUserNickname = async (user, entities) => {
  // Only proceed if user doesn't have a nickname
  if (!user.nickname) {
    const mappedNickname = nicknameMap[user.displayName]
    if (mappedNickname) {
      try {
        // Update user with nickname
        await entities.User.update({
          where: { id: user.id },
          data: { nickname: mappedNickname }
        })

        // Find all PickemChoices with this nickname
        const choices = await entities.PickemChoice.findMany({
          where: { 
            nickname: mappedNickname,
            userChoices: {
              none: {
                userId: user.id
              }
            }
          },
          include: {
            pickem: true
          }
        })

        // Create UserPickemChoices for each matching choice
        for (const choice of choices) {
          await entities.UserPickemChoice.create({
            data: {
              userId: user.id,
              pickemChoiceId: choice.id,
              pickemId: choice.pickem.id
            }
          })
        }

        console.log(`Set nickname ${mappedNickname} for user ${user.displayName} and created their choices`)
        return { success: true, needsManualSelection: false }
      } catch (error) {
        console.error(`Failed to set nickname for user ${user.displayName}:`, error)
        return { success: false, needsManualSelection: true }
      }
    } else {
      console.warn(`No nickname mapping found for user ${user.displayName}`);
      return { success: false, needsManualSelection: true };
    }
  }
  return { success: true, needsManualSelection: false }
}

export const applyNickname = async (userId, nickname, entities) => {
  try {
    // Update user with nickname
    await entities.User.update({
      where: { id: userId },
      data: { nickname }
    })

    // Find all PickemChoices with this nickname
    const choices = await entities.PickemChoice.findMany({
      where: { 
        nickname,
        userChoices: {
          none: {
            userId
          }
        }
      },
      include: {
        pickem: true
      }
    })

    // Create UserPickemChoices for each matching choice
    for (const choice of choices) {
      await entities.UserPickemChoice.create({
        data: {
          userId,
          pickemChoiceId: choice.id,
          pickemId: choice.pickem.id
        }
      })
    }

    console.log(`Set nickname ${nickname} for user ${userId} and created their choices`)
    return { success: true }
  } catch (error) {
    console.error(`Failed to set nickname for user ${userId}:`, error)
    return { success: false, error: error.message }
  }
} 