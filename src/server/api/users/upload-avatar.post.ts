import { existsSync, mkdirSync, unlinkSync } from 'fs'
import { promises as fsPromises } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
	// add middleware here
	
	// check token
	const config = useRuntimeConfig(event)
	const token = getCookie(event, 'auth_token')

    if (!token) {
        throw createError({ statusCode: 401, message: "Unauthorized" })
    }
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }

    const userId = decoded.userId

	// delete old avatar if exists
	const user = await prisma.user.findUnique ({
		where: {id: userId}
	})

	const oldAvatar = user?.avatarUrl

	if (oldAvatar && oldAvatar !== 'default-Avatar.jpg') {

		const oldFileName = oldAvatar.split('/').pop();

		const oldFilePath = path.join('/app/storage/uploads', oldFileName);

		// check if file exists
		if (existsSync(oldFilePath)) {
			try {
				unlinkSync(oldFilePath); // delete file
				console.log(`Old avatar deleted : ${oldFileName}`);
			} catch (err) {
				console.error("Error while deleting old avatar :", err);
			}
		}
	}

	// read multipart data
	const formData = await readMultipartFormData(event)
	if (!formData || !formData[0]) {
		throw createError({ statusCode: 400, message: "No file uploaded." })
	}
	const file = formData[0]

	if (file.data.length > 2 * 1024 * 1024) {
		throw createError({ statusCode: 400, message: "File too large (max 2MB)" })
	}

	// server check to see if it's jpeg or png
	const allowedMimeTypes = ['image/jpeg', 'image/png']
	if (!allowedMimeTypes.includes(file.type!)) {
		throw createError({ statusCode: 400, message: "Invalid file type. Only JPEG or PNG allowed." })
	}

	// generate a random name for the picture
	const fileExtension = file.type!.split('/')[1] // 'jpg' ou 'png'
	const fileName = `${randomUUID()}.${fileExtension}` // random UUID
	
	// path where we will put the picture
	const uploadDir = '/app/storage/uploads'
	const uploadPath = path.join(uploadDir, fileName)

	// check if directory exists
	if (!existsSync(uploadDir)) {
		mkdirSync(uploadDir, { recursive: true })
	}

	// Public url that will be stored in db
	const avatarUrl = `/uploads/${fileName}`

	try {
		// write the file in the project
		await fsPromises.writeFile(uploadPath, file.data)

		// update prisma db
		await prisma.user.update({
			where: { id: userId },
			data: { avatarUrl: avatarUrl }
		})
	
		if (avatarUrl) {
			broadcast({
				type: 'AVATAR_UPDATE',
				userId: userId,
				avatarUrl: avatarUrl
			})
		}

		return { avatarUrl }

	} catch (error) {
		throw createError({ statusCode: 500, message: error })
	}
})
