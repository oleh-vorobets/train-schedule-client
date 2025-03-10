import { authService } from '@/services/auth/auth.service'
import axios from 'axios'
import Cookies from 'js-cookie'

import { useAuthStore } from '@/store/auth/auth.store'

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
	headers: { 'Content-Type': 'application/json' },
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

let isRefreshing = false
let failedQueue: any = []

const processQueue = (error: any, token = null) => {
	failedQueue.forEach((prom: any) => {
		if (error) {
			prom.reject(error)
		} else {
			prom.resolve(token)
		}
	})

	failedQueue = []
}

const forceLogout = () => {
	Cookies.remove('accessToken', { path: '/' })
	Cookies.remove('refreshToken', { path: '/' })

	const domain = window.location.hostname
	Cookies.remove('accessToken', { path: '/', domain })
	Cookies.remove('refreshToken', { path: '/', domain })

	Cookies.set('accessToken', '', { path: '/', domain })
	Cookies.set('refreshToken', '', { path: '/', domain })

	Cookies.set('accessToken', '', { path: '/' })
	Cookies.set('refreshToken', '', { path: '/' })

	useAuthStore.getState().logout()

	if (typeof window !== 'undefined') {
		setTimeout(() => {
			window.location.href = '/login'
		}, 100)
	}
}

api.interceptors.response.use(
	async response => {
		if (response.data) {
			if (response.data.accessToken) {
				const accessExpiration = new Date()
				accessExpiration.setMinutes(accessExpiration.getMinutes() + 15)

				Cookies.set('accessToken', response.data.accessToken, {
					path: '/',
					expires: accessExpiration
				})
			}

			if (response.data.refreshToken) {
				const refreshExpiration = new Date()
				refreshExpiration.setDate(refreshExpiration.getDate() + 7)

				Cookies.set('refreshToken', response.data.refreshToken, {
					path: '/',
					expires: refreshExpiration
				})
			}
		}
		return response
	},
	async error => {
		const originalRequest = error.config

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				})
					.then(token => {
						originalRequest.headers.Authorization = `Bearer ${token}`
						return api(originalRequest)
					})
					.catch(err => {
						return Promise.reject(err)
					})
			}

			originalRequest._retry = true
			isRefreshing = true

			try {
				const response = await authService.refresh()

				if (!response?.accessToken) {
					forceLogout()
					throw new Error('No access token received')
				}

				const accessExpiration = new Date()
				accessExpiration.setMinutes(accessExpiration.getMinutes() + 15)

				Cookies.set('accessToken', response.accessToken, {
					path: '/',
					expires: accessExpiration
				})

				useAuthStore.getState().setIsAuthenticated(true, response.accessToken)

				processQueue(null, response.accessToken as any)

				originalRequest.headers.Authorization = `Bearer ${response.accessToken}`
				isRefreshing = false

				return api(originalRequest)
			} catch (refreshError) {
				processQueue(refreshError, null)

				forceLogout()

				isRefreshing = false
				return Promise.reject(refreshError)
			}
		}

		if (error.response?.status === 401 && originalRequest._retry) {
			forceLogout()
		}

		return Promise.reject(error)
	}
)
