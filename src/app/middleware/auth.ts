import { getCookie } from 'h3'  // ← ajoute cet import

export default defineNuxtRouteMiddleware(async (to) => {
  try {
    const { data } = await useFetch('/api/users/auth')
    if (!data.value) {
      return navigateTo('/login')
    }
  } catch (e) {
    return navigateTo('/login')
  }
})