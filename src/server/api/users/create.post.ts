import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
	const body = await readBody<{ email: string; username: string; password: string }>(event);
	const config = useRuntimeConfig(event)

	console.log('test 1')
	if (!body.email || !body.username || !body.password) {
        throw createError({
            statusCode: 400,
            message: "You need to put something in every field !",
        })
    }
	console.log('test 2')

	if (body.username.length < 3) {
        throw createError({
            statusCode: 400,
            message: "Username must a least be 3 characters long",
        })
    }
	console.log('test 3')

	if (body.password.length < 3) {
        throw createError({
            statusCode: 400,
            message: "Password must a least be 3 characters long",
        })
    }
	console.log('test 4')

	const hash = await bcrypt.hash(body.password, 10)
	console.log('test 5')

	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				username: body.username,
				password: hash,
			},
		});
		console.log('test 6')

		const token = jwt.sign(
			{ userId: user.id },
			config.jwtSecret,
			{ expiresIn: '7d' }
		)
		console.log('test 7')

		// 2. On place ce token dans un Cookie HTTP-only
		setCookie(event, 'auth_token', token, {
			httpOnly: true, //invisible pour le JS malveillant
			secure: process.env.NODE_ENV === 'production', // Uniquement en HTTPS en prod, passer en secure true plus tard
			maxAge: 60 * 60 * 24 * 7, // Garde le cookie 1 semaine (en secondes)
			path: '/' // Disponible sur tout le site
		})
		console.log('test 8')

		//we don't return email nor password
		const {email, password, ...safeUser} = user
		console.log('test 9')

		return {
			safeUser: {
				...safeUser,
				isOnline: safeUser.isOnline > 0
			}
		}

	} catch (e) {
		console.error("ERREUR PRISMA DETECTEE :", e)
		if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                throw createError({
                    statusCode: 409,
                    message: 'This email or username is already taken.'
                })
            }
        } else {
			throw createError({
				statusCode: 500,
				message: 'An unexpected error occurred during registration.'
			})
		}
	}
});
