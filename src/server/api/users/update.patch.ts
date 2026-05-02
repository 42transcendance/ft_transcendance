import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const user = event.context.user // Récupéré via ton middleware d'auth

    // On prépare l'objet de mise à jour
    const updateData: any = {}

    if (body.username) updateData.username = body.username
    if (body.email)    updateData.email = body.email
    
    if (body.password) {
        const hash = await bcrypt.hash(body.password, 10)
        updateData.password = hash
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData
        })
        return { success: true }
    } catch (error) {
        throw createError({ statusCode: 500, statusMessage: "Erreur base de données" })
    }
})
