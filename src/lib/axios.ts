import { authService } from '@/services/auth/auth.service'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
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
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error: AxiosError) => Promise.reject(error)
)

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
	_retry?: boolean
}

let isRefreshing = false
let failedQueue: {
	resolve: (value?: unknown) => void
	reject: (reason?: unknown) => void
}[] = []

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) {
			reject(error)
		} else {
			resolve(token)
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
	async (response: AxiosResponse) => {
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
	async (error: AxiosError) => {
		const originalRequest = error.config as AxiosRequestConfigWithRetry

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				})
					.then(token => {
						if (token && originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${token}`
						}
						return api(originalRequest)
					})
					.catch(err => Promise.reject(err))
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

				processQueue(null, response.accessToken)

				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${response.accessToken}`
				}
				isRefreshing = false

				return api(originalRequest)
			} catch (refreshError) {
				processQueue(refreshError as Error, null)

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
