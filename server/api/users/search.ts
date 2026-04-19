export default defineEventHandler((event) => {
	// Get params in after the '?' in the url
	const query = getQuery(event);
	const nameToSearch = query.name as string;

	if (!nameToSearch) {
		throw createError({ statusCode: 400, message: 'Name required !' });
	}

	// replace mockUsers by database
	// Search in Fake database
	const user = mockUsers.find(u => 
		u.username.toLowerCase() === nameToSearch.toLowerCase()
	);

	if (!user) {
		throw createError({ statusCode: 404, message: 'User not found !' });
	}

	return user;
});
