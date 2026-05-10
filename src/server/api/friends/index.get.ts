import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
	const token = getCookie(event, 'auth_token')
	const config = useRuntimeConfig(event)

	if (!token)
		throw createError({ statusCode: 401, message: 'Unauthorized' })

	const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }

	const friendships = await prisma.friendship.findMany({
		where: {
			OR: [
				{ senderId: decoded.userId },
				{ receiverId: decoded.userId }
			]
		},
		include: {
			sender: { select: { id: true, username: true, avatarUrl: true, isOnline: true, lastSeenAt: true } },
            receiver: { select: { id: true, username: true, avatarUrl: true, isOnline: true, lastSeenAt: true } }
		}
	})

	const friends = friendships
		.filter(f => f.status === 'ACCEPTED')
		.map(f => ({
			friendshipId: f.id,
			user: f.senderId === decoded.userId ? f.receiver : f.sender
		}))

    const pendingReceived = friendships
        .filter(f => f.status === 'PENDING' && f.receiverId === decoded.userId)
        .map(f => ({ friendshipId: f.id, user: f.sender }))

    const pendingSent = friendships
        .filter(f => f.status === 'PENDING' && f.senderId === decoded.userId)
        .map(f => ({ friendshipId: f.id, user: f.receiver }))

    return { friends, pendingReceived, pendingSent }
})
