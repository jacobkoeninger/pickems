import { sanitizeAndSerializeProviderData } from 'wasp/server/auth'

export const devSeedAdmin = async (prisma) => {

  const users = []
  for (let i = 1; i <= 12; i++) {
    const user = await createUser(prisma, {
      username: `user${i}`,
      displayName: `Test User ${i}`,
      isAdmin: false
    })
    users.push(user)
  }
  // Create the 2025 Contest
  const contest = await prisma.contest.create({
    data: {
      name: '2025',
      description: 'Predictions for 2025',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  // Create some sample Pickems
  const categories = await prisma.pickemCategory.createMany({
    data: [
      { name: 'Sports', description: 'Sports related picks' },
      { name: 'Entertainment', description: 'Movies, TV, Music picks' },
      { name: 'Current Events', description: 'News and events picks' }
    ]
  })

  // Create Pickems with choices owned by random users
  const pickems = [
    {
      categoryName: 'Sports',
      choices: ['Lakers win', 'Celtics win']
    },
    {
      categoryName: 'Entertainment', 
      choices: ['Barbie wins Oscar', 'Oppenheimer wins Oscar']
    },
    {
      categoryName: 'Current Events',
      choices: ['Rain tomorrow', 'Sun tomorrow']
    }
  ]

  for (const pickem of pickems) {
    const category = await prisma.pickemCategory.findUnique({
      where: { name: pickem.categoryName }
    })

    await prisma.pickem.create({
      data: {
        categoryId: category.id,
        contestId: contest.id,
        choices: {
          create: pickem.choices.map(choice => ({
            text: choice,
            owner: {
              connect: { id: users[Math.floor(Math.random() * users.length)].id }
            }
          }))
        }
      }
    })
  }
}

async function createUser(prisma, data) {
  const newUser = await prisma.user.create({
    data: {
      username: data.username,
      displayName: data.displayName,
      isAdmin: data.isAdmin || false,
      points: 0
    },
  })

  return newUser
}