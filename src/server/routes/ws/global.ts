import jwt from 'jsonwebtoken'
import { connectedPeers } from '../../utils/peers'

const secret = process.env.NUXT_JWT_SECRET
if (!secret)
    throw new Error('NUXT_JWT_SECRET is not defined')

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

        try {
            const decoded = jwt.verify(token, secret) as { userId: string }

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });

            if (user) {
                peer.ctx = { userId: user.id }
				connectedPeers.set(user.id, peer)
				peer.subscribe('status')

                await prisma.user.update({
                    where: { id: user.id },
                    data: { isOnline: true }
                });
                console.log(`🟢 User ${user.id} is now online`)
				peer.publish('status', JSON.stringify({
					type: 'STATUS_CHANGE',
					userId: user.id,
					isOnline: true
				}))

				peer.subscribe(`user:${user.id}`)
				console.log(`User ${user.id} connected to private channel`)
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

				connectedPeers.delete(userId)

				peer.publish('status', JSON.stringify({
                    type: 'STATUS_CHANGE',
                    userId: userId,
                    isOnline: false,
                    lastSeenAt: new Date()
                }))

                console.log(`🔴 User ${userId} is now offline`);
            } catch (e) {
				if (e.code !== 'P2025')
					console.error("Prisma error when logout", e);
            }
        }
    }
});
