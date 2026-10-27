import type { UserProfile } from '~/types/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<UserProfile | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setSession(newToken: string, newUser: UserProfile) {
    token.value = newToken
    user.value = newUser
  }

  // The real app's login/2FA flow only ever returns a bearer token — the user
  // object is populated afterwards from a separate GET /users/dashboard call.
  function setToken(newToken: string) {
    token.value = newToken
  }

  function setUser(newUser: UserProfile) {
    user.value = newUser
  }

  function logout() {
    token.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, setSession, setToken, setUser, logout }
})
