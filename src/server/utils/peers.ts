const connectedPeers = new Map<string, Set<any>>()

export function addPeer(userId: string, peer: any) {
    if (!connectedPeers.has(userId))
        connectedPeers.set(userId, new Set())
    connectedPeers.get(userId)!.add(peer)
}

export function removePeer(userId: string, peer: any) {
    const peers = connectedPeers.get(userId)
    if (!peers) return
    peers.delete(peer)
    if (peers.size === 0)
        connectedPeers.delete(userId)
}

export function getPeers(userId: string): any[] {
    return [...(connectedPeers.get(userId) ?? [])]
}

export function sendToUser(userId: string, message: any) {
    const payload = JSON.stringify(message)
    for (const peer of getPeers(userId))
        peer.send(payload)
}

export function hasConnectedPeers(userId: string): boolean {
    return (connectedPeers.get(userId)?.size ?? 0) > 0
}

export { connectedPeers }
