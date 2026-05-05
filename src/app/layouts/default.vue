<script setup lang="ts"></script>

<template>
  <ClientOnly>
    <div>
      <Navbar />
      <Profile />
      <main class="main-content">
        <slot />
      </main>
      <footer class="footer">
        <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
        <span>·</span>
        <NuxtLink to="/terms">Terms of Service</NuxtLink>
      </footer>
    </div>
  </ClientOnly>
</template>

<style scoped>
.main-content {
  margin-top: 60px;
  padding: 20px;
}

.footer {
  text-align: center;
  padding: 1.5rem;
  margin-top: 2rem;
  font-size: 0.85rem;
  color: #888;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.footer a {
  color: #888;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>
