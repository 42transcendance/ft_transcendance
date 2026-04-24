export default defineEventHandler(async (event) => {
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

	return user;
});
