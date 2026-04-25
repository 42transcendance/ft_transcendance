export default defineEventHandler(async (event) => {
	// protection middleware
	const token = getCookie(event, 'auth_token')
  	if (!token) throw createError({ statusCode: 401, message: 'Non autorisé' })
	// get the id
	const id = getRouterParam(event, 'id');
	const user = await prisma.user.findUnique({
		where: { id: id }
	});

	if (!user) {
		throw createError({statusCode: 404, message: 'No user found'});
	}

	//we don't return email nor password
	const { email, password, ...safeUser } = user
	return { safeUser }
})

