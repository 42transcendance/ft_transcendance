import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
	// 1. Lire le cookie que le navigateur a envoyé automatiquement
	const token = getCookie(event, 'auth_token')
	const SECRET_KEY = 'bipboup-Voici-la-cle'
	// 2. Si pas de token, on renvoie une erreur (401 = Non autorisé)
	if (!token)
		return null

	try {
		const decoded = jwt.verify(token, SECRET_KEY) as { userId: string }
		const user = await prisma.user.findUnique({
			where: {
				id: decoded.userId,
			},
		});
		if (user) {
			//we don't return email nor password
			const { email, password, ...safeUser } = user
			return { safeUser }
		}
	} catch (e) {
		return null
	}
})
