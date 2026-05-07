import jwt from 'jsonwebtoken'
import { connectedPeers } from '../../utils/peers'

const secret = process.env.NUXT_JWT_SECRET
if (!secret)
  throw new Error('NUXT_JWT_SECRET is not defined')

export default defineWebSocketHandler({
  async open(peer) {
    const cookieHeader = peer.request?.headers.get('cookie')
    if (!cookieHeader) {
      peer.close(1008, 'Unauthorized')
      return
    }

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
        where: { id: decoded.userId },
        select: { id: true, username: true }
      })

      if (!user) {
        peer.close(1008, 'Unauthorized')
        return
      }

      peer.ctx = { userId: user.id, username: user.username }
      peer.subscribe('chat')
	  connectedPeers.set(`chat:${user.id}`, peer)
      console.log(`💬 Chat: ${user.username} connected`)
    } catch (e) {
      peer.close(1008, 'Unauthorized')
      return
    }
  },

  async message(peer, message) {
    if (!peer.ctx?.userId) return

    try {
      const data = JSON.parse(message.text())

      if (data.type !== 'message') return
      if (!data.content || data.content.trim().length === 0) return
      if (data.content.length > 500) return

      const newMessage = await prisma.globalMessage.create({
        data: {
          content: data.content.trim(),
          senderId: peer.ctx.userId,
		  senderUsername: peer.ctx.username
        }
      })

      const broadcast = JSON.stringify({
        type: 'message',
        data: {
          id: newMessage.id,
          content: newMessage.content,
          username: peer.ctx.username,
          senderId: peer.ctx.userId,
          createdAt: newMessage.createdAt
        }
      })

      peer.publish('chat', broadcast)
      peer.send(broadcast)
    } catch (e) {
      console.error('Erreur message chat:', e)
    }
  },

  close(peer) {
    if (peer.ctx?.username) {
      connectedPeers.delete(`chat:${peer.ctx.userId}`)
      console.log(`💬 Chat: ${peer.ctx.username} disconnected`)
    }
  }
})