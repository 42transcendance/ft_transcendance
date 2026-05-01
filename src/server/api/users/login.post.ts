import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	const config = useRuntimeConfig(event)
	const SECRET_KEY = config.jwtSecret

	const user = await prisma.user.findUnique({
		where: { username: body.username }
	});

	const okPassword = await bcrypt.compare(body.password, user.password)

	if (user && okPassword) {

		const token = jwt.sign(
			{ userId: user.id },
			SECRET_KEY,
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

		return { safeUser }
	}
	throw createError({ statusCode: 401, message: 'Identifiants invalides' })
});

