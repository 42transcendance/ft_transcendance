export default defineEventHandler(async (event) => {
	const body = await readBody<{ username: string; password: string }>(event);

	const user = await prisma.user.create({
		data: {
			username: body.username,
			password: body.password,
		},
	});

	return user;
});
