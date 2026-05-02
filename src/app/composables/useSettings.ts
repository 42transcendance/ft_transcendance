export const useSettings = () => {
    const { currentUser } = useAuth()

    const updateProfile = async (payload: any) => {
        try {
            const response = await $fetch('/api/users/update', {
                method: 'PATCH',
                body: payload
            })

            if (currentUser.value && response.user) {
                currentUser.value = {
                    ...currentUser.value,
                    ...response.user
                }
            }
            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.data?.message || 'Update failed' }
        }
    }

    return { updateProfile }
}
