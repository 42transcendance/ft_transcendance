export default defineEventHandler(event => {
	// get the id
	const id = getRouterParam(event, 'id');
	// replace mockUsers by database
	const user = mockUsers.find(u => u.id === Number(id));

	if (!user) {
		throw createError({statusCode: 404, message: 'No user found'});
	}

	return user;
})

