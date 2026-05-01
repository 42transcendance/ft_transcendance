<script setup lang="ts">
	// middleware protection
	definePageMeta({
		middleware: 'auth'
	})

	const route = useRoute()
	const { currentUser } = useAuth()

	// Récupération du profil
	const { data: user, error } = await useFetch(`/api/users/${route.params.id}`)

	if (error.value) {
		throw createError({ statusCode: 404, message: 'User not found' })
	}

	// ✅ Vérifier si c'est bien notre propre profil
	const isOwner = computed(() =>
		String(currentUser.value?.id) === String(route.params.id)
	)

	const fileInput = ref<HTMLInputElement | null>(null)
	const previewImage = ref<string | null>(currentUser.value?.avatarUrl || null)
	const uploadError = ref('')

	function onFileSelected(event: Event) {
		const target = event.target as HTMLInputElement
		const file = target.files?.[0]
		if (!file) return

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
</script>

<template>
	<div class="profile-wrapper">
		<h1 class="profile-title">
			{{ isOwner ? 'Your Profile' : `${user?.safeUser?.username}'s Profile` }}
		</h1>

		<div class="avatar-section">
			<img
				:src="previewImage || '/default-avatar.jpg'"
				alt="Avatar"
				class="avatar-preview"
			/>

			<!-- ✅ Uniquement si c'est ton profil -->
			<template v-if="isOwner">
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
					class="save-btn"
				>
					Save changes
				</button>
				<p v-if="uploadError" class="error">{{ uploadError }}</p>
			</template>
		</div>

		<div class="info-section">
			<p><strong>Username :</strong> {{ user?.safeUser?.username }}</p>
		</div>
	</div>
</template>

<style scoped>
	.profile-wrapper {
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

	.info-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.hidden {
		display: none;
	}
</style>
