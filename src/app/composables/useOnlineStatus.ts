const onlineStatuses = ref<Record<string, boolean>>({})

export const useOnlineStatus = () => {

    function updateUserStatus(username: string, isOnline: boolean) {
        onlineStatuses.value[userId] = isOnline
    }

    function isOnline(username: string): boolean {
        return onlineStatuses.value[userId] ?? false
    }

    return { updateUserStatus, isOnline }
}
