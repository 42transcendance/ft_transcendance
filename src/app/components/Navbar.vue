<script setup lang="ts">
	const { currentUser, logout} = useAuth()
	const { toggleChat } = useChat()

</script>

<template>
  <nav class="fixed w-full bg-white/90 shrink-1 p-4 pl-8 pr-8 z-2 flex flex-col">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
      <div class="flex gap-2">
        <NuxtLink class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-inherit" to="/">Logo</NuxtLink>
        <NuxtLink class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-inherit" to="/game">Play</NuxtLink>
      </div>

      <NavBtnsSearchBar v-if="currentUser" class="search-bar" />

      <div class="flex gap-2">
        <NuxtLink class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-inherit" v-if="!currentUser" to="/login">Login</NuxtLink>
        <NuxtLink class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-inherit" v-if="!currentUser" to="/signup">Sign up</NuxtLink>
        <button class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-inherit" v-if="currentUser" @click="toggleChat">Chat</button>
        <NuxtLink class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-inherit" v-if="currentUser" :to="`/profile/${currentUser?.id}`">Profile</NuxtLink>
        <button v-if="currentUser" @click="logout" class="p-4 pt-1 pb-1 rounded-md bg-blue-100 hover:bg-blue-200 cursor-pointer text-inherit p-0">Logout</button>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
