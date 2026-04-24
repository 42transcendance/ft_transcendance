import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
	// 1. Lire le cookie que le navigateur a envoyé automatiquement
	const token = getCookie(event, 'auth_token')
	const SECRET_KEY = 'bipboup-Voici-la-cle'
	// 2. Si pas de token, on renvoie une erreur (401 = Non autorisé)
	if (!token)
		return null

	try {
		const decoded = jwt.verify(token, SECRET_KEY) as { userId: number }
		const user = await prisma.user.findUnique({
			where: {
				id: decoded.userId,
			},
		});
		// const user = mockUsers.find(u => u.id === decoded.userId);
		if (user) {
			const { password, ...userWithoutPassword } = user
			return userWithoutPassword
		}
	} catch (e) {
		return null
	}
})
