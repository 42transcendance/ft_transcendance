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
	const { pendingUsernameUpdate } = useOnlineStatus()

	watch(pendingUsernameUpdate, (update) => {
		if (update && currentUser.value?.id === update.userId) {
			currentUser.value = { ...currentUser.value, username: update.username }
		}
	})

	// Avatar
	const fileInput = ref<HTMLInputElement | null>(null)
	const previewImage = ref<string | null>(currentUser?.value?.avatarUrl || null)
	const uploadError = ref('')
	const uploadSuccess = ref(false)

	function onFileSelected(event: Event) {
		const target = event.target as HTMLInputElement
		const file = target.files?.[0]
		if (!file) { uploadSuccess.value = false; return }

		if (file.size > 2 * 1024 * 1024) {
			uploadSuccess.value = false
			uploadError.value = 'File is too big (max 2MB)!'
			return
		}
		if (!file.type.startsWith('image/')) {
			uploadSuccess.value = false
			uploadError.value = 'File must be an image!'
			return
		}
		uploadError.value = ''
		const reader = new FileReader()
		reader.onload = (e) => { previewImage.value = e.target?.result as string }
		reader.readAsDataURL(file)
	}

	async function uploadAvatar() {
		const file = fileInput.value?.files?.[0]
		if (!file) { uploadSuccess.value = false; return }

		const formData = new FormData()
		formData.append('avatar', file)
		try {
			const response = await $fetch('/api/users/upload-avatar', { method: 'POST', body: formData })
			if (currentUser.value) currentUser.value.avatarUrl = response.avatarUrl
			uploadSuccess.value = true
		} catch (e: any) {
			uploadSuccess.value = false
			uploadError.value = e.statusText || 'Upload failed.'
		}
	}

	// Popup username
	const showUsernamePopup = ref(false)
	const newUsername = ref('')
	const usernamePassword = ref('')
	const usernameError = ref('')
	const usernameSuccess = ref(false)

	async function submitUsername() {
		usernameError.value = ''
		if (!newUsername.value) { usernameSuccess.value = false; usernameError.value = 'Please enter a username'; return }
		if (!usernamePassword.value) { usernameSuccess.value = false; usernameError.value = 'Please enter your password'; return }

		const { success, error } = await updateProfile({ username: newUsername.value, currentPassword: usernamePassword.value })
		if (success) {
			showUsernamePopup.value = false
			newUsername.value = ''
			usernamePassword.value = ''
			usernameSuccess.value = true
		} else {
			usernameSuccess.value = false
			usernameError.value = error
		}
	}

	// Popup password
	const showPasswordPopup = ref(false)
	const currentPassword = ref('')
	const newPassword = ref('')
	const confirmPassword = ref('')
	const passwordError = ref('')
	const passwordSuccess = ref(false)

	async function submitPassword() {
		passwordError.value = ''
		if (!currentPassword.value) { passwordSuccess.value = false; passwordError.value = 'Please enter your current password'; return }
		if (!newPassword.value) { passwordSuccess.value = false; passwordError.value = 'Please enter a new password'; return }
		if (newPassword.value !== confirmPassword.value) { passwordSuccess.value = false; passwordError.value = "Passwords don't match!"; return }

		const { success, error } = await updateProfile({ currentPassword: currentPassword.value, newPassword: newPassword.value })
		if (success) {
			showPasswordPopup.value = false
			currentPassword.value = ''
			newPassword.value = ''
			confirmPassword.value = ''
			passwordSuccess.value = true
		} else {
			passwordSuccess.value = false
			passwordError.value = error
		}
	}

	// Popup delete
	const showDeletePopup = ref(false)
	const deletePassword = ref('')
	const deleteError = ref('')

	async function submitDelete() {
		deleteError.value = ''
		if (!deletePassword.value) { deleteError.value = 'Please enter your current password to confirm'; return }

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
	<Card title="Settings">
		<div class="flex flex-col gap-4 w-full">

			<!-- Avatar -->
			<section class="flex flex-col items-center gap-3 border border-blue-100 rounded-md p-5">
				<h2 class="text-blue-800 font-semibold text-base">Avatar</h2>
				<img :src="previewImage || '/default-avatar.jpg'" alt="Avatar" class="w-24 h-24 rounded-full object-cover border-2 border-blue-200" />
				<input type="file" ref="fileInput" accept="image/png, image/jpeg" @change="onFileSelected" class="hidden" />
				<button type="button" @click="fileInput?.click()" class="bg-blue-800 outline outline-blue-800 rounded-md mt-4 p-2 hover:bg-blue-900 hover:cursor-pointer">Change Avatar</button>
				<button v-if="fileInput?.files?.length" type="button" @click="uploadAvatar" class="bg-blue-800 outline outline-blue-800 rounded-md mt-4 p-2 hover:bg-blue-900 hover:cursor-pointer">Save Avatar</button>
				<FormError v-if="uploadError" :label="uploadError" />
				<UpdateSuccess v-if="uploadSuccess" label="Avatar Updated !" />
			</section>

			<!-- Username -->
			<section class="flex flex-col items-center gap-3 border border-blue-100 rounded-md p-5">
				<h2 class="text-blue-800 font-semibold text-base">Username</h2>
				<p class="text-blue-400 text-sm">Current: {{ currentUser?.username }}</p>
				<button type="button" @click="showUsernamePopup = true" class="bg-blue-800 outline outline-blue-800 rounded-md mt-4 p-2 hover:bg-blue-900 hover:cursor-pointer">Change Username</button>
				<UpdateSuccess v-if="usernameSuccess" label="Username Updated !" />
			</section>

			<!-- Password -->
			<section class="flex flex-col items-center gap-3 border border-blue-100 rounded-md p-5">
				<h2 class="text-blue-800 font-semibold text-base">Password</h2>
				<button type="button" @click="showPasswordPopup = true" class="bg-blue-800 outline outline-blue-800 rounded-md mt-4 p-2 hover:bg-blue-900 hover:cursor-pointer">Change Password</button>
				<UpdateSuccess v-if="passwordSuccess" label="Password Updated !" />
			</section>

			<!-- Delete account -->
			<section class="flex flex-col items-center gap-3 border border-blue-100 rounded-md p-5">
				<h2 class="text-blue-800 font-semibold text-base">Account</h2>
				<button type="button" @click="showDeletePopup = true" class="bg-blue-800 outline outline-blue-800 rounded-md mt-4 p-2 hover:bg-blue-900 hover:cursor-pointer">Delete Account</button>
			</section>
		</div>
	</Card>

	<!-- Popup username -->
	<div v-if="showUsernamePopup" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[3000]" @click.self="showUsernamePopup = false">
		<div class="bg-blue-50 p-8 rounded-md flex flex-col gap-4 w-80">
			<h3 class="text-blue-900 text-center font-semibold text-base">Change Username</h3>
			<form @submit.prevent="submitUsername" class="flex flex-col gap-4">
				<FormField v-model="newUsername" label="New username" placeholder="johndoe" type="text" />
				<FormField v-model="usernamePassword" label="Password" placeholder="" type="password" />
				<FormError v-if="usernameError" :label="usernameError" />
				<div class="flex justify-between gap-3">
					<button type="button" @click="showUsernamePopup = false" class="bg-blue-800 outline outline-blue-800 rounded-md mt-4 p-2 hover:bg-blue-900 hover:cursor-pointer">Cancel</button>
					<FormButton label="Confirm" />
				</div>
			</form>
		</div>
	</div>

	<!-- Popup password -->
	<div v-if="showPasswordPopup" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[3000]" @click.self="showPasswordPopup = false">
		<div class="bg-blue-50 p-8 rounded-md flex flex-col gap-4 w-80">
			<h3 class="text-blue-900 text-center font-semibold text-base">Change Password</h3>
			<form @submit.prevent="submitPassword" class="flex flex-col gap-4">
				<FormField v-model="currentPassword" label="Current password" placeholder="" type="password" />
				<FormField v-model="newPassword" label="New password" placeholder="" type="password" />
				<FormField v-model="confirmPassword" label="Confirm new password" placeholder="" type="password" />
				<FormError v-if="passwordError" :label="passwordError" />
				<div class="flex justify-between gap-3">
					<button type="button" @click="showPasswordPopup = false" class="bg-blue-800 outline outline-blue-800 rounded-md mt-4 p-2 hover:bg-blue-900 hover:cursor-pointer">Cancel</button>
					<FormButton label="Confirm" />
				</div>
			</form>
		</div>
	</div>

	<!-- Popup delete -->
	<div v-if="showDeletePopup" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[3000]" @click.self="showDeletePopup = false">
		<div class="bg-blue-50 p-8 rounded-md flex flex-col gap-4 w-80">
			<h3 class="text-blue-900 text-center font-semibold text-base">Delete Account</h3>
			<p class="text-blue-400 text-sm text-center">This action is irreversible. Please enter your password to confirm.</p>
			<form @submit.prevent="submitDelete" class="flex flex-col gap-4">
				<FormField v-model="deletePassword" label="Password" placeholder="" type="password" />
				<FormError v-if="deleteError" :label="deleteError" />
				<div class="flex justify-between gap-3">
					<button type="button" @click="showDeletePopup = false" class="bg-blue-800 outline outline-blue-800 rounded-md mt-4 p-2 hover:bg-blue-900 hover:cursor-pointer">Cancel</button>
					<button type="submit" class="bg-red-700 rounded-md mt-4 p-2 hover:bg-red-800 hover:cursor-pointer">Delete</button>
				</div>
			</form>
		</div>
	</div>
</template>