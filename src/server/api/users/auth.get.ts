import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
	const token = getCookie(event, 'auth_token')
	const config = useRuntimeConfig(event)

	if (!token)
		return createError({ statusCode: 401, message: 'Unauthorized' })

	try {
		const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }
		const user = await prisma.user.findUnique({
			where: {
				id: decoded.userId,
			},
		});
		if (user) {
			//we don't return email nor password
			const { email, password, ...safeUser } = user
			return { safeUser }
		} else {
			return createError({ statusCode: 401, message: 'Unauthorized' })
		}
	} catch (e) {
		return createError({ statusCode: 401, message: 'Unauthorized' })
	}
})
