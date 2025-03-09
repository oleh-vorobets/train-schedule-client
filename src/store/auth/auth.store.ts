import { AuthStore } from './auth.types'
import { create } from 'zustand'

export const useAuthStore = create<AuthStore>(set => ({
	isAuthenticated: false,
	token: null,
	setIsAuthenticated: (isAuthenticated, token) =>
		set({ isAuthenticated, token }),
	logout: () => set({ token: null, isAuthenticated: false })
}))
