export const useProfile = () => {
	const isProfileOpen = useState('isProfileOpen', () => false)
    const selectedUser = useState('selectedUser', () => null)
	const errorMessage = useState('errorMessage', () => '')

    const openProfile = (user: any) => {
        selectedUser.value = user
        isProfileOpen.value = true
		errorMessage.value = ''
    }

    const closeProfile = () => {
        isProfileOpen.value = false
		selectedUser.value = null
    }

	const setError = (msg: string) => {
		errorMessage.value = msg
		setTimeout(() => { errorMessage.value = '' }, 3000);
	}

    return {
        isProfileOpen,
        selectedUser,
		errorMessage,
        openProfile,
        closeProfile,
		setError
    }
}
