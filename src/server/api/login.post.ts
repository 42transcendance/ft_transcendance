import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	console.log("Body reçu:", body)
	const SECRET_KEY = 'bipboup-Voici-la-cle'
	// Simulation de vérification (changer avec la vrai database)
	// const user = mockUsers.find(u => body.username === u.username && body.password === u.password)
	const user = await prisma.user.findUnique({
		where: { username: body.username }
	});
	if (user && user.password === body.password) {

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

		// 3. On renvoie les infos publiques de l'utilisateur
		// changer et ne pas envoyer le mdp
		return { user }
	}
	throw createError({ statusCode: 401, message: 'Identifiants invalides' })
});

