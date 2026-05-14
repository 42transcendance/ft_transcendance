import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  const config = useRuntimeConfig(event)

  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  try {
    jwt.verify(token, config.jwtSecret)
  } catch (e) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  try {
	const messages = await prisma.globalMessage.findMany({
		take: 50,
		orderBy: { createdAt: 'desc' },
		include: {
		sender: { select: { id: true, username: true } }
		}
	})
  } catch (e) {
	throw createError({ statusCode: 500, message: 'Database error' })
  }

  // Tri chronologique
  const sortedMessages = [...messages].reverse()

  // Numérote chaque user supprimé : "DELETED USER", "DELETED USER 1", "DELETED USER 2"...
  const deletedUsersMap = new Map<string, string>()  // senderUsername (ancien) → display name
  let deletedCounter = 0

  const result = sortedMessages.map(m => {
    let displayUsername: string
    const isDeleted = m.sender === null

    if (isDeleted) {
      // L'user est supprimé : utilise senderUsername (l'ancien nom) comme clé
      const oldUsername = m.senderUsername
      
      if (!deletedUsersMap.has(oldUsername)) {
        // Premier message d'un user supprimé
        const label = deletedCounter === 0 ? 'Deleted user' : `Deleted user ${deletedCounter}`
        deletedUsersMap.set(oldUsername, label)
        deletedCounter++
      }
      
      displayUsername = deletedUsersMap.get(oldUsername)!
    } else {
      // User toujours actif : nom actuel
      displayUsername = m.sender!.username
    }

    return {
      id: m.id,
      content: m.content,
      username: displayUsername,
      senderId: m.senderId,
      isDeleted,
      createdAt: m.createdAt
    }
  })

  return result
})
