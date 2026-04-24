import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
	const body = await readBody<{ email: string; username: string; password: string }>(event);
	const SECRET_KEY = 'bipboup-Voici-la-cle'

	//a ameliorer;
	const user = await prisma.user.create({
		data: {
			email: body.email,
			username: body.username,
			password: body.password,
		},
	});

	const token = jwt.sign(
		{ userId: user.id },
		SECRET_KEY,
		{ expiresIn: '7d' }
	)

	// 2. On place ce token dans un Cookie HTTP-only
	setCookie(event, 'auth_token', token, {
		httpOnly: true, //invisible pour le JS malveillant
		secure: process.env.NODE_ENV === 'production', // Uniquement en HTTPS en prod
		maxAge: 60 * 60 * 24 * 7, // Garde le cookie 1 semaine (en secondes)
		path: '/' // Disponible sur tout le site
	})

	return user;
});
