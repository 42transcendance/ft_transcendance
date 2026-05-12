import jwt from 'jsonwebtoken'
import { sendToUser } from '../../utils/peers'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig(event)

    if (!token)
        throw createError({ statusCode: 401, message: 'Unauthorized' })

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }

    if (!body.receiverId)
        throw createError({ statusCode: 400, message: 'receiverId required' })

    if (body.receiverId === decoded.userId)
        throw createError({ statusCode: 400, message: 'You cannot add yourself' })

    const existing = await prisma.friendship.findFirst({
        where: {
            OR: [
                { senderId: decoded.userId, receiverId: body.receiverId },
                { senderId: body.receiverId, receiverId: decoded.userId }
            ]
        }
    })

    if (existing)
        throw createError({ statusCode: 409, message: 'Friendship already exists' })

    const friendship = await prisma.friendship.create({
        data: { senderId: decoded.userId, receiverId: body.receiverId }
    })

	sendToUser(body.receiverId, { type: 'FRIEND_UPDATE' })

    return { friendship }
})
