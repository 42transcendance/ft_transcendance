import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const config = useRuntimeConfig(event)
    const token = getCookie(event, 'auth_token')

    if (!token)
        throw createError({ statusCode: 401, message: 'Unauthorized' })

	let decoded : {userId: string}
	try {
		decoded = jwt.verify(token, config.jwtSecret) as { userId: string }
	} catch {
		throw createError({ statusCode: 401, message: 'Invalid token' })
	}

    const userId = decoded.userId

    const updateData: any = {}

	
	const user = await prisma.user.findUnique({ where: { id: userId } })
	if (!user)
		throw createError({ statusCode: 404, message: 'User not found' })

	if (body.username || body.newPassword) {
		if (!body.currentPassword)
			throw createError({ statusCode: 400, message: 'Current password required' })

		const isValid = await bcrypt.compare(body.currentPassword, user.password)

		if (!isValid)
			throw createError({ statusCode: 401, message: 'Wrong current password' })
	}

	if (body.username) {
		if (body.username.length < 3)
			throw createError({ statusCode: 400, message: 'Username must be at least 3 characters' })
		updateData.username = body.username
	}
	if (body.newPassword) {
		if (body.newPassword.length < 3)
			throw createError({ statusCode: 400, message: 'Password must be at least 3 characters' })
		updateData.password = await bcrypt.hash(body.newPassword, 10)
	}

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        })

        const { email, password, ...safeUser } = updatedUser

		if (body.username) {
			broadcastAll({
				type: 'USERNAME_UPDATE',
				userId: userId,
				username: safeUser.username,
			})
		}

		return {
			success: true,
			safeUser: {
				...safeUser,
				isOnline: safeUser.isOnline > 0
			}
		}
    } catch (error: any) {
        // Code P2002 = username taken
        if (error.code === 'P2002')
            throw createError({ statusCode: 409, message: 'Username already taken' })
		else
			throw createError({ statusCode: 500, message: 'Database error' })
    }
})
