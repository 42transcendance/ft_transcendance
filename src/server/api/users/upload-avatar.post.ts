import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
	// add middleware here
	
	// check token
	const SECRET_KEY = 'bipboup-Voici-la-cle'
	const token = getCookie(event, 'auth_token')

    if (!token) {
        throw createError({ statusCode: 401, message: "Non connecté" })
    }
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number }

    const userId = decoded.userId

	// read multipart data
	const formData = await readMultipartFormData(event)
	if (!formData || !formData[0]) {
		throw createError({ statusCode: 400, message: "No file uploaded." })
	}
	const file = formData[0]
	
	// server check to see if it's jpeg or png
	const allowedMimeTypes = ['image/jpeg', 'image/png']
	if (!allowedMimeTypes.includes(file.type!)) {
		throw createError({ statusCode: 400, message: "Invalid file type. Only JPEG or PNG allowed." })
	}

	// generate a random name for the picture
	const fileExtension = file.type!.split('/')[1] // 'jpg' ou 'png'
	const fileName = `${randomUUID()}.${fileExtension}` // random UUID
	
	// path where we will put the picture
	const uploadPath = path.join(process.cwd(), 'src', 'public', 'uploads', fileName)
	
	// Public url that will be stored in db
	const avatarUrl = `/uploads/${fileName}`

	try {
		// write the file in the project
		await fs.writeFile(uploadPath, file.data)

		// update prisma db
		await prisma.user.update({
		  where: { id: userId },
		  data: { avatarUrl: avatarUrl }
		})

		console.log(`Fichier enregistré : ${uploadPath}`)
		
		return { avatarUrl }

	} catch (error) {
		console.error("Upload error:", error)
		throw createError({ statusCode: 500, message: "Failed to save file." })
	}
})
