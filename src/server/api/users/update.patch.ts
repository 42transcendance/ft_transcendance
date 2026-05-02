import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const config = useRuntimeConfig(event)
    const token = getCookie(event, 'auth_token')

    if (!token)
        throw createError({ statusCode: 401, message: 'Non-authorized' })

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }
    const userId = decoded.userId

    const updateData: any = {}

    if (body.username)
        updateData.username = body.username

    if (body.newPassword) {
        const user = await prisma.user.findUnique({
			where: { id: userId }
		})
        if (!user)
            throw createError({ statusCode: 404, message: 'User not found' })

        const isValid = await bcrypt.compare(body.currentPassword, user.password)
        if (!isValid)
            throw createError({ statusCode: 401, message: 'Wrong current password' })

		if (body.newPassword.length < 3)
			throw createError({ statusCode: 400, message: "Password must a least be 3 characters long" })

        updateData.password = await bcrypt.hash(body.newPassword, 10)
    }

    if (body.username) {
        const user = await prisma.user.findUnique({
			where: { id: userId }
		})
        if (!user)
            throw createError({ statusCode: 404, message: 'User not found' })

        const isValid = await bcrypt.compare(body.currentPassword, user.password)
        if (!isValid)
            throw createError({ statusCode: 401, message: 'Wrong current password' })

		if (body.username.length < 3)
			throw createError({ statusCode: 400, message: "Username must a least be 3 characters long" })

    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        })

        const { email, password, ...safeUser } = updatedUser
        return { success: true, user: safeUser }
    } catch (error: any) {
        // Code P2002 = username taken
        if (error.code === 'P2002')
            throw createError({ statusCode: 409, message: 'Username already taken' })
        throw createError({ statusCode: 500, message: 'Database error' })
    }
})
