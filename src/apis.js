
export const bulkCreatePickems = async (req, res, context) => {
  try {
    // if (!context.user?.isAdmin) {
    //   return res.status(403).json({ message: 'Only admins can bulk create pickems' })
    // }

    const { contestId, pickems } = req.body

    if (!contestId) {
      return res.status(400).json({ message: 'Contest ID is required' })
    }

    if (!Array.isArray(pickems)) {
      return res.status(400).json({ message: 'Pickems must be an array' })
    }

    // Get all users with nicknames to map owners
    const users = await context.entities.User.findMany({
      where: {
        nickname: {
          not: null
        }
      },
      select: {
        id: true,
        nickname: true
      }
    })

    // Create map of nickname to user ID
    const ownerMap = {}
    for (const user of users) {
      ownerMap[user.nickname] = user.id
    }

    const createdPickems = []

    for (const pickem of pickems) {
      // Create the choices first
      const choices = []
      
      const createChoice = (prediction) => {
        if (!prediction) return
        
        const ownerId = prediction.owner ? ownerMap[prediction.owner] : null
        // Skip warning about missing owner since it's optional
        
        return {
          text: prediction.text,
          ...(ownerId && {
            owner: {
              connect: { id: ownerId }
            }
          })
        }
      }

      const choice1 = createChoice(pickem.prediction1)
      if (choice1) choices.push(choice1)

      const choice2 = createChoice(pickem.prediction2) 
      if (choice2) choices.push(choice2)

      // Create the pickem with its choices
      const createdPickem = await context.entities.Pickem.create({
        data: {
          category: {
            connectOrCreate: {
              where: { name: pickem.category },
              create: { name: pickem.category }
            }
          },
          contest: {
            connect: { id: contestId }
          },
          choices: {
            create: choices
          }
        },
        include: {
          choices: true,
          category: true
        }
      })

      createdPickems.push(createdPickem)
    }

    res.set("Access-Control-Allow-Origin", "*")
    return res.json({
      message: 'Successfully created pickems',
      data: createdPickems
    })

  } catch (error) {
    console.error('Error creating bulk pickems:', error)
    res.set("Access-Control-Allow-Origin", "*")
    return res.status(500).json({ 
      message: 'Error creating pickems',
      error: error.message 
    })
  }
}
