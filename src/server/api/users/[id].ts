import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, message: 'Non autorisé' })

    const id = getRouterParam(event, 'id')
    const method = getMethod(event)

    // ✅ Pour toute modification, vérifier que c'est bien son profil
    if (method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
        const config = useRuntimeConfig(event)
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }

        if (String(decoded.userId) !== String(id)) {
            throw createError({ statusCode: 403, message: 'Forbidden' })
        }
    }

    const user = await prisma.user.findUnique({ where: { id: id } })
    if (!user) throw createError({ statusCode: 404, message: 'No user found' })

    const { email, password, ...safeUser } = user
    return { safeUser }
})