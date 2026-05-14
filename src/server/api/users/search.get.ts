import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
	const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig(event)
    if (!token)
        throw createError({ statusCode: 401, message: 'Unauthorized' })

    try {
        jwt.verify(token, config.jwtSecret)
    } catch {
        throw createError({ statusCode: 401, message: 'Invalid token' })
    }

	// Get params in after the '?' in the url
	const query = getQuery(event);
	const nameToSearch = query.name as string;

	if (!nameToSearch) {
		throw createError({ statusCode: 400, message: 'Username required !' });
	}

	const user = await prisma.user.findUnique({
		where: { username: nameToSearch }
	});

	if (!user) {
		throw createError({ statusCode: 404, message: 'User not found !' });
	}

	//we don't return email nor password
	const {email, password, ...safeUser} = user

	return {
		safeUser: {
			...safeUser,
			isOnline: safeUser.isOnline > 0
		}
	}
});
