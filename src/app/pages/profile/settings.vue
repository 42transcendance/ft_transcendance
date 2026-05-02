<script setup lang="ts">
	// middleware protection
	definePageMeta({
		middleware: 'auth'
	})

	const { currentUser } = useAuth()
	const {updateProfile} = useSettings()


	// ✅ Vérifier si c'est bien notre propre profil
	const isOwner = computed(() =>
		String(currentUser.value?.id) === String(route.params.id)
	)

	const fileInput = ref<HTMLInputElement | null>(null)
	const previewImage = ref<string | null>(currentUser?.value?.avatarUrl || null)
	const uploadError = ref('')

	function onFileSelected(event: Event) {
		const target = event.target as HTMLInputElement
		const file = target.files?.[0]
		if (!file)
			return

		if (file.size > 2 * 1024 * 1024) {
			uploadError.value = "File is too big (max 2MB) !"
			return
		}

		if (!file.type.startsWith('image/')) {
			uploadError.value = "File must be an image !"
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
		if (!file) return

		const formData = new FormData()
		formData.append('avatar', file)

		try {
			const response = await $fetch('/api/users/upload-avatar', {
				method: 'POST',
				body: formData,
			})

			if (currentUser.value) {
				currentUser.value.avatarUrl = response.avatarUrl
			}
			alert("Avatar updated !")
		} catch (e) {
			uploadError.value = e.statusText || "Upload failed."
		}
	}

	const username = ref(currentUser.value?.safeUser?.username || '')
	const password = ref('')
	const confirmPassword = ref('')

	const handleUpdate = async () => {
		if (password.value && password.value !== confirmPassword.value) {
			return alert("Passwords don't match !")
		}

		const body: any = {}
		
		if (username.value !== currentUser.value?.safeUser?.username)
			body.username = username.value
		if (password.value)
			body.password = password.value

		if (Object.keys(body).length === 0) {
			await navigateTo(`/profile/${currentUser.value?.id}`)
			return
		}

		const { success, error } = await updateProfile(body)
		if (success) {
			alert("Profile updated with success !")
			await navigateTo(`/profile/${currentUser.value?.id}`)
		} else {
			alert("Error : " + error)
		}
	}
</script>

<template>
	<div class="profile-wrapper">
		<h1 class="profile-title">
			Profile Modification
		</h1>

		<div class="avatar-section">
			<img
				:src="previewImage || '/default-avatar.jpg'"
				alt="Avatar"
				class="avatar-preview"
			/>

			<input
				type="file"
				ref="fileInput"
				accept="image/png, image/jpeg"
				@change="onFileSelected"
				class="hidden"
			/>
			<button @click="fileInput?.click()" class="change-btn">Change Avatar</button>
			<button
				v-if="fileInput?.files?.length"
				@click="uploadAvatar"
				class="save-avatar-btn"
			>
				Save changes
			</button>
			<p v-if="uploadError" class="error">{{ uploadError }}</p>
		</div>
		<form @submit.prevent="handleUpdate" class="modify-form">
			<input v-model="username" type="text" placeholder="Username" class="username-input">
			<input v-model="password" type="password" placeholder="New password (optionnal)" class="pswd-input">
			<input v-model="confirmPassword" type="password" placeholder="Confirm new password" class="pswd-input">
			<button type="submit" class="save-btn">Save</button>
		</form>
	</div>
</template>

<style scoped>
	.profile-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 30px;
		border: 1px solid #ccc;
		padding: 10px;
		margin-top: 10px;
	}

	.profile-title {
		text-align: center;
		align-items: center;
		gap: 20px;
	}

	.avatar-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.avatar-preview {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #ddd;
		justify-content: center;
	}

	.hidden {
		display: none;
	}

	.change-btn {
		text-align: center;
		background-color: #BABABA;
		color: white;
		border: none;
		padding: 10px;
		border-radius: 5px 5px 5px 5px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.change-btn:hover {
		background-color: #42b883;
	}

	.save-avatar-btn {
		text-align: center;
		background-color: #BABABA;
		color: white;
		border: none;
		padding: 10px;
		border-radius: 5px 5px 5px 5px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.save-avatar-btn:hover {
		background-color: #42b883;
	}

	.modify-form {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.username-input {
		padding: 10px 20px;
	}

	.pswd-input {
		padding: 10px 20px;
	}

	.save-btn {
		text-align: center;
		background-color: #BABABA;
		color: white;
		border: none;
		padding: 10px;
		border-radius: 5px 5px 5px 5px;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	.save-btn:hover {
		background-color: #42b883;
	}


</style>
