export default defineEventHandler(async (event) => {
	const body = await readBody<{ email: string; username: string; password: string }>(event);

	//a ameliorer;
	
	const user = await prisma.user.create({
		data: {
			email: body.email,
			username: body.username,
			password: body.password,
		},
	});

	return user;
});
