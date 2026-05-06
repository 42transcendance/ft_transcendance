import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
	const token = getCookie(event, 'auth_token')
	const config = useRuntimeConfig(event)

	if (!token)
		throw createError({ statusCode: 401, message: 'Unauthorized' })

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

			return {
				safeuser: {
					...safeuser,
					isonline: safeuser.isonline > 0
				}
			}
		} else {
			throw createError({ statusCode: 401, message: 'Unauthorized' })
		}
	} catch (e) {
		throw createError({ statusCode: 401, message: 'Unauthorized' })
	}
})
