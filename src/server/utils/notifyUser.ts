import { connectedPeers } from './peers'

export function notifyUser(userId: string, message: object) {
    const peer = connectedPeers.get(userId)
    if (peer) {
        peer.send(JSON.stringify(message))
        console.log(`[WS] Notification envoyée à ${userId}`)
    }
}

export function broadcast(message: object) {
    connectedPeers.forEach(peer => {
        peer.send(JSON.stringify(message))
    })
}
