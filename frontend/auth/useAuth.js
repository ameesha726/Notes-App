import { create } from 'zustand'

export const useAuth = create((set) => ({
  
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null,

  setToken: (token, user = null) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
      if (user) localStorage.setItem('user', JSON.stringify(user))
    }
    set({ token, user })
  },

  // Logout function: clears token and user from state and localStorage
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    set({ token: null, user: null })
  },
}))
