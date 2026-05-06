<script setup lang="ts"></script>

<template>
  <ClientOnly>
    <div>
      <Navbar />
      <Profile />
	  <NavBtnsNotifBtn />	
      <main class="main-content">
        <slot />
      </main>
      <footer class="text-center py-6 mt-8 text-sm text-gray-500 border-t border-gray-200 flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
        <NuxtLink to="/privacy" class="text-gray-500 no-underline hover:underline">Privacy Policy</NuxtLink>
        <span class="hidden sm:inline">·</span>
        <NuxtLink to="/terms" class="text-gray-500 no-underline hover:underline">Terms of Service</NuxtLink>
      </footer>
    </div>
  </ClientOnly>
</template>

<style scoped>
.main-content {
  margin-top: 60px;
  padding: 20px;
}
</style>
