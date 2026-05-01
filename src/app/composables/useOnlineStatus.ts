const pendingStatusChange = ref<{ userId: string, isOnline: boolean, lastSeenAt: Date } | null>(null)

export const useOnlineStatus = () => {

    function notifyStatusChange(userId: string, isOnline: boolean, lastSeenAt: Date) {
        pendingStatusChange.value = { userId, isOnline, lastSeenAt }
    }

    return { notifyStatusChange, pendingStatusChange }
}
