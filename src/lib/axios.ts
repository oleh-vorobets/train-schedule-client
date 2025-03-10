import { authService } from '@/services/auth/auth.service'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

import { useAuthStore } from '@/store/auth/auth.store'

const MAX_RETRIES = 1
let isRefreshing = false
let refreshQueue: ((token: string) => void)[] = []

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
	_retry?: number
}

const saveTokens = (accessToken?: string, refreshToken?: string) => {
	const expirationDate = new Date()

	if (accessToken) {
		Cookies.set('accessToken', accessToken, {
			path: '/',
			expires: expirationDate.setDate(expirationDate.getMinutes() + 15)
		})
	}
	if (refreshToken) {
		Cookies.set('refreshToken', refreshToken, {
			path: '/',
			expires: expirationDate.setDate(expirationDate.getDate() + 7)
		})
	}
}

const refreshToken = async (): Promise<string> => {
	if (isRefreshing) {
		return new Promise(resolve => {
			refreshQueue.push(resolve)
		})
	}

	isRefreshing = true
	try {
		const response = await authService.refresh()
		if (!response.accessToken) throw new Error('No access token received')

		const newToken = response.accessToken
		saveTokens(newToken)
		useAuthStore.getState().setIsAuthenticated(true, newToken)

		refreshQueue.forEach(resolve => resolve(newToken))
		refreshQueue = []

		return newToken
	} catch (error) {
		await authService.logout()
		useAuthStore.getState().logout()
		if (typeof window !== 'undefined') window.location.reload()
		throw error
	} finally {
		isRefreshing = false
	}
}

const handleUnauthorizedError = async (error: AxiosError) => {
	const originalRequest = error.config as AxiosRequestConfigWithRetry

	if (originalRequest._retry && originalRequest._retry >= MAX_RETRIES) {
		await authService.logout()
		useAuthStore.getState().logout()
		if (typeof window !== 'undefined') window.location.href = '/login'
		return Promise.reject(error)
	}

	originalRequest._retry = (originalRequest._retry || 0) + 1

	try {
		const newToken = await refreshToken()

		originalRequest.headers = originalRequest.headers || {}
		originalRequest.headers.Authorization = `Bearer ${newToken}`
		return api(originalRequest)
	} catch (refreshError) {
		await authService.logout()
		useAuthStore.getState().logout()
		if (typeof window !== 'undefined') window.location.href = '/login'
		return Promise.reject(refreshError)
	}
}

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
	headers: { 'Content-Type': 'application/json' },
	withCredentials: true
})

api.interceptors.request.use(
	config => {
		const token = useAuthStore.getState().token
		if (token) {
			config.headers = config.headers || {}
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error: AxiosError) => Promise.reject(error)
)

api.interceptors.response.use(response => {
	if (response.data?.accessToken || response.data?.refreshToken) {
		saveTokens(response.data.accessToken, response.data.refreshToken)
	}
	return response
}, handleUnauthorizedError)
