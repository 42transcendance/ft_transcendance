export const useSettings = () => {
	const { currentUser } = useAuth()

    const updateProfile = async (payload: any) => {
        try {
            const response = await $fetch('/api/users/update', {
                method: 'PATCH',
                body: payload
            })

			if (currentUser.value && response.user) {
                currentUser.value.safeUser = { 
                    ...currentUser.value.safeUser, 
                    ...response.user 
                }
            }
            return { success: true }
        } catch (error) {
            return { success: false, error: error.statusMessage || "Update failed" }
        }
    }

    return {
        updateProfile
    }
}

