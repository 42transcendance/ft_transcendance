import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { existsSync, unlinkSync } from 'fs'
import path from 'node:path'
import { connectedPeers } from '../../utils/peers'

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
    const config = useRuntimeConfig(event)
    const token = getCookie(event, 'auth_token')
    if (!token)
        throw createError({ statusCode: 401, message: 'Non-authorized' })
	if (!body.password)
        throw createError({ statusCode: 400, message: 'Password required' })

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }
	const user = await prisma.user.findUnique({
		where: { id: decoded.userId }
	})
    if (!user)
        throw createError({ statusCode: 404, message: 'User not found' })

    const isValid = await bcrypt.compare(body.password, user.password)
    if (!isValid)
        throw createError({ statusCode: 401, message: 'Wrong password' })

	// On garde l'ancien username pour le broadcast
	const oldUsername = user.username

	const oldAvatar = user?.avatarUrl
	if (oldAvatar && oldAvatar !== 'default-Avatar.jpg') {
		const oldFileName = oldAvatar.split('/').pop();
		const oldFilePath = path.join('/app/storage/uploads', oldFileName);
		if (existsSync(oldFilePath)) {
			try {
				unlinkSync(oldFilePath);
				console.log(`Old avatar deleted : ${oldFileName}`);
			} catch (err) {
				throw createError({ statusCode: 400, message: err })
			}
		}
	}

	await prisma.friendship.deleteMany({
		where: {
			OR: [
				{ senderId: decoded.userId },
				{ receiverId: decoded.userId }
			]
		}
	})

    await prisma.user.delete({
        where: { id: decoded.userId }
    })

	// Broadcast à tous les clients du chat
	const broadcast = JSON.stringify({
		type: 'user_deleted',
		data: { oldUsername }
	})

	for (const [key, peer] of connectedPeers.entries()) {
		if (key.startsWith('chat:')) {
			try {
				peer.send(broadcast)
			} catch (e) {
				console.error('Erreur broadcast user_deleted:', e)
			}
		}
	}

    deleteCookie(event, 'auth_token')
    return { success: true }
})