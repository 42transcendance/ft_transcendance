<script setup lang="ts">
	useHead({
		title: 'Settings'
	})

	definePageMeta({ middleware: 'auth' })

	const { data, error } = await useFetch('/api/users/auth')
	if (error.value || !data.value)
		await navigateTo('/login')

	const { currentUser, logout } = useAuth()
	const { updateProfile, deleteProfile } = useSettings()

	// Avatar
	const fileInput = ref<HTMLInputElement | null>(null)
	const previewImage = ref<string | null>(currentUser?.value?.avatarUrl || null)
	const uploadError = ref('')

	function onFileSelected(event: Event) {
		const target = event.target as HTMLInputElement
		const file = target.files?.[0]
		if (!file)
			return

		if (file.size > 2 * 1024 * 1024) {
			uploadError.value = 'File is too big (max 2MB)!'
			return
		}

		if (!file.type.startsWith('image/')) {
			uploadError.value = 'File must be an image!'
			return
		}

		uploadError.value = ''
		const reader = new FileReader()
		reader.onload = (e) => {
			previewImage.value = e.target?.result as string
		}
		reader.readAsDataURL(file)
	}

	async function uploadAvatar() {
		const file = fileInput.value?.files?.[0]
		if (!file)
			return

		const formData = new FormData()
		formData.append('avatar', file)
		try {
			const response = await $fetch('/api/users/upload-avatar', {
				method: 'POST',
				body: formData
			})
			if (currentUser.value)
				currentUser.value.avatarUrl = response.avatarUrl
			alert('Avatar updated!')
		} catch (e: any) {
			uploadError.value = e.statusText || 'Upload failed.'
		}
	}

	// Popup username
	const showUsernamePopup = ref(false)
	const newUsername = ref('')
	const usernamePassword = ref('')
	const usernameError = ref('')

	async function submitUsername() {
		usernameError.value = ''
		if (!newUsername.value) {
			usernameError.value = 'Please enter a username'
			return
		}
		if (!usernamePassword.value) {
			usernameError.value = 'Please enter your password'
			return
		}

		const { success, error } = await updateProfile({
			username: newUsername.value,
			currentPassword: usernamePassword.value
		})

		if (success) {
			showUsernamePopup.value = false
			newUsername.value = ''
			usernamePassword.value = ''
			alert('Username updated!')
		} else {
			usernameError.value = error
		}
	}

	// Popup password
	const showPasswordPopup = ref(false)
	const currentPassword = ref('')
	const newPassword = ref('')
	const confirmPassword = ref('')
	const passwordError = ref('')

	async function submitPassword() {
		passwordError.value = ''
		if (!currentPassword.value) {
			passwordError.value = 'Please enter your current password'
			return
		}
		if (!newPassword.value) {
			passwordError.value = 'Please enter a new password'
			return
		}

		if (newPassword.value !== confirmPassword.value) {
			passwordError.value = "Passwords don't match!"
			return
		}

		const { success, error } = await updateProfile({
			currentPassword: currentPassword.value,
			newPassword: newPassword.value
		})

		if (success) {
			showPasswordPopup.value = false
			currentPassword.value = ''
			newPassword.value = ''
			confirmPassword.value = ''
			alert('Password updated!')
		} else {
			passwordError.value = error
		}
	}


	// Popup delete
	const showDeletePopup = ref(false)
	const deletePassword = ref('')
	const deleteError = ref('')

	async function submitDelete() {
		deleteError.value = ''
		if (!deletePassword.value) {
			deleteError.value = 'Please enter your current password to confirm'
			return
		}

		const { success, error } = await deleteProfile(deletePassword.value)

		if (success) {
			showDeletePopup.value = false
			deletePassword.value = ''
			alert('Account deleted!')
			await logout()
		} else {
			deleteError.value = error
		}
	}

</script>

<template>
    <div class="settings-wrapper">
        <h1>Settings</h1>

        <!-- Avatar -->
        <section class="section">
            <h2>Avatar</h2>
            <img :src="previewImage || '/default-avatar.jpg'" alt="Avatar" class="avatar-preview" />
            <input type="file" ref="fileInput" accept="image/png, image/jpeg" @change="onFileSelected" class="hidden" />
            <button @click="fileInput?.click()" class="btn">Change Avatar</button>
            <button v-if="fileInput?.files?.length" @click="uploadAvatar" class="btn">Save Avatar</button>
            <p v-if="uploadError" class="error">{{ uploadError }}</p>
        </section>

        <!-- Username -->
        <section class="section">
            <h2>Username</h2>
            <p class="current-value">Current : {{ currentUser?.username }}</p>
            <button @click="showUsernamePopup = true" class="btn">Change Username</button>
        </section>

        <!-- Password -->
        <section class="section">
            <h2>Password</h2>
            <button @click="showPasswordPopup = true" class="btn">Change Password</button>
        </section>

        <!-- Delete account -->
		<button @click="showDeletePopup = true" class="delete-btn">Delete Account</button>

        <!-- Popup username -->
        <div v-if="showUsernamePopup" class="overlay" @click.self="showUsernamePopup = false">
            <div class="popup">
                <h3>Change Username</h3>
                <input v-model="newUsername" type="text" placeholder="New username" class="input" />
                <input v-model="usernamePassword" type="password" placeholder="Your password" class="input" />
                <p v-if="usernameError" class="error">{{ usernameError }}</p>
                <div class="popup-actions">
                    <button @click="showUsernamePopup = false" class="btn-cancel">Cancel</button>
                    <button @click="submitUsername" class="btn">Confirm</button>
                </div>
            </div>
        </div>

        <!-- Popup password -->
        <div v-if="showPasswordPopup" class="overlay" @click.self="showPasswordPopup = false">
            <div class="popup">
                <h3>Change Password</h3>
                <input v-model="currentPassword" type="password" placeholder="Current password" class="input" />
                <input v-model="newPassword" type="password" placeholder="New password" class="input" />
                <input v-model="confirmPassword" type="password" placeholder="Confirm new password" class="input" />
                <p v-if="passwordError" class="error">{{ passwordError }}</p>
                <div class="popup-actions">
                    <button @click="showPasswordPopup = false" class="btn-cancel">Cancel</button>
                    <button @click="submitPassword" class="btn">Confirm</button>
                </div>
            </div>
        </div>

        <!-- Popup delete -->
        <div v-if="showDeletePopup" class="overlay" @click.self="showDeletePopup = false">
            <div class="popup">
                <h3>Delete account</h3>
                <input v-model="deletePassword" type="password" placeholder="Current password" class="input" />
                <p v-if="deleteError" class="error">{{ passwordError }}</p>
                <div class="popup-actions">
                    <button @click="showDeletePopup = false" class="btn-cancel">Cancel</button>
                    <button @click="submitDelete" class="btn">Confirm</button>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
	.settings-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 30px;
		padding: 20px;
		max-width: 500px;
		margin: 0 auto;
	}

	.section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 20px;
		border: 1px solid #eee;
		border-radius: 10px;
	}

	.current-value {
		color: #888;
		font-size: 0.9rem;
	}

	.avatar-preview {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #ddd;
	}

	.hidden { display: none; }

	.btn {
		background-color: #BABABA;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.3s;
	}
	.btn:hover { background-color: #42b883; }

	.btn-cancel {
		background-color: transparent;
		color: #888;
		border: 1px solid #ddd;
		padding: 10px 20px;
		border-radius: 5px;
		cursor: pointer;
	}
	.btn-cancel:hover {
		background-color: #f5f5f5;
	}

	.delete-btn {
		background-color: #BABABA;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 5px;
		cursor: pointer;
		transition: background-color 0.3s;
	}
	.delete-btn:hover { background-color: #E32B2B; }

	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3000;
	}

	.popup {
		background: white;
		padding: 30px;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		gap: 15px;
		width: 340px;
		box-shadow: 0 10px 30px rgba(0,0,0,0.2);
	}

	.popup h3 {
		text-align: center;
		margin: 0;
	}

	.input {
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 5px;
		width: 100%;
		box-sizing: border-box;
	}

	.popup-actions {
		display: flex;
		justify-content: space-between;
		gap: 10px;
	}

	.error {
		color: red;
		font-size: 0.85rem;
		text-align: center;
	}
</style>
