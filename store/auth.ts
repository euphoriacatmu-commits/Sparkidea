import { create } from 'zustand'

interface AuthState {
  isAdmin: boolean
  isLoggedIn: boolean
  username: string | null
  isChecked: boolean
  checkAuth: () => Promise<void>
  setAuth: (isAdmin: boolean, username: string | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAdmin: false,
  isLoggedIn: false,
  username: null,
  isChecked: false,

  checkAuth: async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        set({
          isAdmin: data.role === 'admin',
          isLoggedIn: !!data.username,
          username: data.username || null,
          isChecked: true,
        })
      } else {
        set({ isAdmin: false, isLoggedIn: false, username: null, isChecked: true })
      }
    } catch {
      set({ isAdmin: false, isLoggedIn: false, username: null, isChecked: true })
    }
  },

  setAuth: (isAdmin, username) =>
    set({ isAdmin, isLoggedIn: !!username, username, isChecked: true }),

  clearAuth: () =>
    set({ isAdmin: false, isLoggedIn: false, username: null, isChecked: true }),
}))
