import { getCookie } from 'h3'  // ← ajoute cet import

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    const event = useRequestEvent()
    const token = getCookie(event!, 'auth_token')
    if (!token) return navigateTo('/login')
  }
  // TODO: ajouter vérification côté client quand on gère le refresh token
})