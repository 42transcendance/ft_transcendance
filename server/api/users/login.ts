export default defineEventHandler(event => {
	const query = getQuery(event);
	const nameToLog = query.name as string;
	const pswdToLog = query.pswd as string;
	
	if (!nameToLog || !pswdToLog) {
		throw createError({ statusCode: 400, message: 'Username or Password required !' });	
	}

	// replace mockUsers by database
	// Search in Fake database
	const user = mockUsers.find(u => 
		u.username === nameToLog &&
		u.password === pswdToLog
	);

	if (!user) {
		throw createError({ statusCode: 404, message: 'User not found !' });
	}

	return user;
})
