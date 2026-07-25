import { create } from 'zustand'

const storedToken = localStorage.getItem('lotca_token')
const storedUser = localStorage.getItem('lotca_user')

export const useAuthStore = create((set) => ({
  token: storedToken || null,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,

  setAuth: (token, user) => {
    localStorage.setItem('lotca_token', token)
    localStorage.setItem('lotca_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('lotca_token')
    localStorage.removeItem('lotca_user')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
