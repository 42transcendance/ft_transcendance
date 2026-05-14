import jwt from 'jsonwebtoken'
import { sendToUser } from '../../utils/peers'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig(event)

    if (!token)
        throw createError({ statusCode: 401, message: 'Unauthorized' })

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }

    if (!body.friendshipId)
        throw createError({ statusCode: 400, message: 'friendshipId required' })

    const friendship = await prisma.friendship.findUnique({
        where: { id: body.friendshipId }
    })

    if (!friendship)
        throw createError({ statusCode: 404, message: 'Friendship not found' })

    if (friendship.senderId !== decoded.userId && friendship.receiverId !== decoded.userId)
        throw createError({ statusCode: 403, message: 'Forbidden' })

    await prisma.friendship.delete({
		where:
			{ id: body.friendshipId }
	})

	const otherUserId = friendship.senderId === decoded.userId 
		? friendship.receiverId 
		: friendship.senderId
	sendToUser(otherUserId, { type: 'FRIEND_UPDATE' })

    return { success: true }
})
