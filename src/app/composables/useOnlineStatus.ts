const pendingStatusChange = ref<{ userId: string, isOnline: boolean } | null>(null)

export const useOnlineStatus = () => {

    function notifyStatusChange(userId: string, isOnline: boolean) {
        pendingStatusChange.value = { userId, isOnline }
    }

    return { notifyStatusChange, pendingStatusChange }
}
