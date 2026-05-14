import jwt from 'jsonwebtoken'
import { sendToUser } from '../../utils/peers'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig(event)

    if (!token)
        throw createError({ statusCode: 401, message: 'Unauthorized' })

	let decoded : {userId: string}
	try {
		decoded = jwt.verify(token, config.jwtSecret) as { userId: string }
	} catch {
		throw createError({ statusCode: 401, message: 'Invalid token' })
	}

    if (!body.friendshipId || !body.action)
        throw createError({ statusCode: 400, message: 'friendshipId and action required' })

    if (!['ACCEPTED', 'DECLINED'].includes(body.action))
        throw createError({ statusCode: 400, message: 'action must be ACCEPTED or DECLINED' })

    const friendship = await prisma.friendship.findUnique({
        where: { id: body.friendshipId }
    })

    if (!friendship)
        throw createError({ statusCode: 404, message: 'Friendship not found' })
	
    if (friendship.receiverId !== decoded.userId)
        throw createError({ statusCode: 403, message: 'Forbidden' })

    if (friendship.status !== 'PENDING')
        throw createError({ statusCode: 400, message: 'Friendship is not pending' })

    if (body.action === 'DECLINED') {
        await prisma.friendship.delete({
			where:
				{ id: body.friendshipId }
		})

		sendToUser(friendship.senderId, { type: 'FRIEND_UPDATE' })
		sendToUser(decoded.userId, { type: 'FRIEND_UPDATE' })

        return { success: true, action: 'DECLINED' }
    } else {
		const updated = await prisma.friendship.update({
			where: { id: body.friendshipId },
			data: { status: 'ACCEPTED' }
		})

		sendToUser(friendship.senderId, { type: 'FRIEND_UPDATE' })
		sendToUser(decoded.userId, { type: 'FRIEND_UPDATE' })

		return { success: true, action: 'ACCEPTED', friendship: updated }
	}
})
