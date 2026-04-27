<!-- <script setup lang="ts"> -->
<!-- 	// middleware proctection -->
<!-- 	definePageMeta({ -->
<!-- 		middleware: 'auth' -->
<!-- 	}) -->
<!-- 	//get all address informations -->
<!-- 	const route = useRoute(); -->
<!-- 	//get data from the user -->
<!-- 	const {data: user, error} = await useFetch(`/api/users/${route.params.id}`); -->
<!-- </script> -->
<!---->
<!-- <template> -->
<!-- 	<div v-if="user" style="border: 1px solid #ccc; padding: 10px; margin-top: 10px;" class="profile-card"> -->
<!-- 		<h2>Profil found :</h2> -->
<!-- 		<img :src="user.safeUser.avatar" alt="Avatar" width="100" /> -->
<!-- 		<p><strong>Username :</strong> {{ user.safeUser.username }}</p> -->
<!-- 		<p><strong>isOnline :</strong> {{ user.safeUser.isOnline }}</p> -->
<!-- 		<p><strong>lastSeenAt :</strong> {{ user.safeUser.lastSeenAt }}</p> -->
<!-- 		<NuxtLink to="/">Back to home</NuxtLink> -->
<!-- 	</div> -->
<!-- 	<div v-else-if="error"> -->
<!-- 		<p>Erreur : No user found</p> -->
<!-- 		<NuxtLink to="/">Go Back</NuxtLink> -->
<!-- 	</div> -->
<!-- </template> -->
<!---->
<!-- <style scoped></style> -->







<script setup lang="ts">
	// middleware proctection
	definePageMeta({
		middleware: 'auth'
	})
	//get all address informations
	const route = useRoute();
	//get data from the user
	const {data: user, error} = await useFetch(`/api/users/${route.params.id}`);


	const { currentUser } = useAuth()
	const fileInput = ref<HTMLInputElement | null>(null)
	const previewImage = ref<string | null>(currentUser.value?.avatarUrl || null)
	const uploadError = ref('')

	//Selection of a profile picture
	function onFileSelected(event: Event) {
		//We say we want a file, and we get the first selected one
		const target = event.target as HTMLInputElement
		const file = target.files?.[0]
		if (!file)
			return

		// Max 2Mo
		if (file.size > 2 * 1024 * 1024) {
			uploadError.value = "File is too big (max 2MB) !"
			return
		}

		// Check if the file is an image
		if (!file.type.startsWith('image/')) {
			uploadError.value = "File must be an image !"
			return
		}

		uploadError.value = ''
		
		// Local visualisation, the file reader is here to help us render the image
		const reader = new FileReader()
		reader.onload = (e) => {
			previewImage.value = e.target?.result as string
		}
		reader.readAsDataURL(file)
	}

	//Saving of a profile picture
	async function uploadAvatar() {
		const file = fileInput.value?.files?.[0]
		if (!file)
			return

		// We need to use FormData to upload a file
		const formData = new FormData()
		formData.append('avatar', file)

		try {
			const response = await $fetch('/api/users/upload-avatar', {
			method: 'POST',
			body: formData, // $fetch automaticaly handle Content-Type: multipart/form-data
			})

			//currentUser update
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
		<h1>Your Profile</h1>
		
		<div class="avatar-section">
			<img :src="previewImage || '/default-avatar.png'" alt="Avatar" class="avatar-preview" />
			
			<input 
				type="file" 
				ref="fileInput" 
				accept="image/png, image/jpeg" 
				@change="onFileSelected" 
				class="hidden"
			/>
			
			<button @click="fileInput?.click()" class="btn-secondary">Choose Image</button>
			<button v-if="fileInput?.files?.length" @click="uploadAvatar" class="btn-primary">Save Avatar</button>
			
			<p v-if="uploadError" class="error">{{ uploadError }}</p>
		</div>
		<div class="info-section">
			<p><strong>Username :</strong> {{ user?.safeUser?.username }}</p>
			<p><strong>isOnline :</strong> {{ user?.safeUser?.isOnline }}</p>
			<p><strong>lastSeenAt :</strong> {{ user?.safeUser?.lastSeenAt }}</p>
		</div>
	</div>
</template>

<style scoped>
	.profile-wrapper {
		border: 1px solid #ccc;
		padding: 10px;
		margin-top: 10px;
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
