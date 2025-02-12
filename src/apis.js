export const bulkCreatePickems = async (req, res, context) => {
  try {
    const { contestId, pickems } = req.body

    if (!contestId) {
      return res.status(400).json({ message: 'Contest ID is required' })
    }

    if (!Array.isArray(pickems)) {
      return res.status(400).json({ message: 'Pickems must be an array' })
    }

    // Get unique categories from pickems
    const uniqueCategories = [...new Set(pickems.map(p => p.category))]

    // Create/connect all categories upfront
    console.log('Creating/connecting categories:', uniqueCategories)
    await Promise.all(uniqueCategories.map(categoryName => 
      context.entities.PickemCategory.upsert({
        where: { name: categoryName },
        create: { name: categoryName },
        update: {}
      })
    ))

    const createdPickems = []

    for (const pickem of pickems) {
      // Create the choices first
      const choices = []
      
      const createChoice = (prediction) => {
        if (!prediction) return
        
        const choice = {
          text: prediction.text,
          nickname: prediction.owner || null // Store the nickname directly
        }
        
        return choice
      }

      const choice1 = createChoice(pickem.prediction1)
      if (choice1) choices.push(choice1)

      const choice2 = createChoice(pickem.prediction2) 
      if (choice2) choices.push(choice2)

      console.log(`Adding pickem with choices: ${JSON.stringify(choices)}`)

      // Create the pickem with its choices
      const createdPickem = await context.entities.Pickem.create({
        data: {
          category: {
            connect: { name: pickem.category }
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
