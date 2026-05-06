import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
	const body = await readBody<{ email: string; username: string; password: string }>(event);
	const config = useRuntimeConfig(event)

	if (!body.email || !body.username || !body.password) {
        throw createError({
            statusCode: 400,
            message: "You need to put something in every field !",
        })
    }

	if (body.username.length < 3) {
        throw createError({
            statusCode: 400,
            message: "Username must a least be 3 characters long",
        })
    }

	if (body.password.length < 3) {
        throw createError({
            statusCode: 400,
            message: "Password must a least be 3 characters long",
        })
    }

	const hash = await bcrypt.hash(body.password, 10)

	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				username: body.username,
				password: hash,
			},
		});

		const token = jwt.sign(
			{ userId: user.id },
			config.jwtSecret,
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

		return {
			safeUser: {
				...safeUser,
				isOnline: safeUser.isOnline > 0
			}
		}
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                throw createError({
                    statusCode: 409,
                    message: 'This email or username is already taken.'
                })
            }
        }

        throw createError({
            statusCode: 500,
            message: 'An unexpected error occurred during registration.'
        })
	}
});
