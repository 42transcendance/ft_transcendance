const pendingStatusUpdate = ref<{ userId: string, isOnline: boolean, lastSeenAt: Date } | null>(null)
const pendingUsernameUpdate = ref<{ userId: string, username: string } | null>(null)
const pendingAvatarUpdate = ref<{ userId: string, avatar: string } | null>(null)

export const useOnlineStatus = () => {

    function notifyStatusUpdate(userId: string, isOnline: boolean, lastSeenAt: Date) {
        pendingStatusUpdate.value = { userId, isOnline, lastSeenAt }
    }

	function notifyUsernameUpdate(userId: string, username: string) {
		pendingUsernameUpdate.value = { userId, username }
	}

	function notifyAvatarUpdate(userId: string, avatarUrl: string) {
		pendingAvatarUpdate.value = { userId, avatarUrl }
	}
    return {
		notifyStatusUpdate,
		notifyUsernameUpdate,
		notifyAvatarUpdate,
		pendingStatusUpdate,
		pendingUsernameUpdate,
		pendingAvatarUpdate
	}
}
