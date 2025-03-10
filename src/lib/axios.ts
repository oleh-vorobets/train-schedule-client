import { authService } from '@/services/auth/auth.service'
import axios from 'axios'

import { useAuthStore } from '@/store/auth/auth.store'

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
})

api.interceptors.request.use(
	config => {
		const token = useAuthStore.getState().token
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	error => Promise.reject(error)
)

api.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			try {
				const response = await authService.refresh()

				const newToken = response.accessToken
				useAuthStore.getState().setIsAuthenticated(true, newToken)

				originalRequest.headers.Authorization = `Bearer ${newToken}`
				return api(originalRequest)
			} catch (refreshError) {
				authService.logout()
				useAuthStore.getState().logout()
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	}
)
