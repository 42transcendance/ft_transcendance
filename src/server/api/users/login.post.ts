import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	const config = useRuntimeConfig(event)

	if (!body.username || !body.password)
		throw createError({ statusCode: 400, message: 'Username and password required' })

	const user = await prisma.user.findUnique({
		where: { username: body.username }
	});

	if (!user)
		throw createError({ statusCode: 401, message: 'Invalid credentials' })

	const isValid = await bcrypt.compare(body.password, user.password)
	if (!isValid)
		throw createError({ statusCode: 401, message: 'Invalid credentials' })

	const token = jwt.sign(
		{ userId: user.id },
		config.jwtSecret,
		{ expiresIn: '7d' }
	)

	// 2. On place ce token dans un Cookie HTTP-only
	setCookie(event, 'auth_token', token, {
		httpOnly: true, //invisible pour le JS malveillant
		secure: process.env.NODE_ENV === 'production', // Uniquement en HTTPS en prod, passer en secure true plus tard
		maxAge: 60 * 60 * 24 * 7, // Garde le cookie 1 semaine (en secondes)
		path: '/' // Disponible sur tout le site
	})

	//we don't return email nor password
	const {email, password, ...safeUser} = user

	return {
		safeUser: {
			...safeUser,
			isOnline: safeUser.isOnline > 0
		}
	}
});

