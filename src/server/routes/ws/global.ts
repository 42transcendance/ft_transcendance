import jwt from 'jsonwebtoken'

export default defineWebSocketHandler({
    async open(peer) {
		//get cookie
		const cookieHeader = peer.request?.headers.get('cookie')

		if (!cookieHeader) {
			peer.close(1008, 'Unauthorized')
            return
		}

		//cookie parsing
		const cookies = Object.fromEntries(
			cookieHeader.split(';').map(c => {
				const [key, ...v] = c.trim().split('=')
				return [key, v.join('=')]
			})
		)

		const token = cookies['auth_token']

        if (!token) {
			peer.close(1008, 'Unauthorized')
            return
        }
        const SECRET_KEY = 'bipboup-Voici-la-cle';

        try {
            const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });

            if (user) {
                peer.ctx = { userId: user.id };

				peer.subscribe('status')

                await prisma.user.update({
                    where: { id: user.id },
                    data: { isOnline: true }
                });

				peer.publish('status', JSON.stringify({
					type: 'STATUS_CHANGE',
					userId: user.id,
					isOnline: true
				}))

                console.log(`🟢 User ${user.username} est en ligne`);
            }
        } catch (e) {
			peer.close(1008, 'Unauthorized')
            return
        }
    },

    async close(peer) {
        const userId = peer.ctx?.userId;
        if (userId) {
            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: { 
                        isOnline: false, 
                        lastSeenAt: new Date() 
                    }
                });

				peer.publish('status', JSON.stringify({
                    type: 'STATUS_CHANGE',
                    userId: userId,
                    isOnline: false,
                    lastSeenAt: new Date()
                }))

                console.log(`🔴 User ${userId} est maintenant déconnecté`);
            } catch (e) {
                console.error("Erreur Prisma lors de la déconnexion", e);
            }
        }
    }
});
