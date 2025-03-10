import { authService } from '@/services/auth/auth.service'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const MAX_RETRIES = 1
let isRefreshing = false
let refreshQueue: ((token: string) => void)[] = []

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
	_retry?: number
}

export const saveTokens = (accessToken?: string, refreshToken?: string) => {
	if (accessToken) {
		localStorage.setItem('accessToken', accessToken)
		Cookies.set('accessToken', accessToken, {
			expires: 0.001 // TODO: CHANGE TO 15 minutes
		})
	}
	if (refreshToken) {
		localStorage.setItem('refreshToken', refreshToken)
		Cookies.set('refreshToken', refreshToken, { expires: 7 })
	}
}

export const deleteTokens = () => {
	localStorage.removeItem('accessToken')
	localStorage.removeItem('refreshToken')

	Cookies.set('accessToken', '', {
		expires: 0.0001,
		path: '/'
	})

	Cookies.set('refreshToken', '', { expires: 7, path: '/' })

	Cookies.remove('accessToken')
	Cookies.remove('refreshToken')
}

export const getTokens = () => {
	const accessToken =
		localStorage.getItem('accessToken') || Cookies.get('accessToken')
	const refreshToken =
		localStorage.getItem('refreshToken') || Cookies.get('refreshToken')
	return { accessToken, refreshToken }
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
		saveTokens(newToken, response.refreshToken)

		refreshQueue.forEach(resolve => resolve(newToken))
		refreshQueue = []

		return newToken
	} catch (error) {
		await authService.logout()
		if (typeof window !== 'undefined') window.location.reload()
		throw error
	} finally {
		isRefreshing = false
	}
}

const handleUnauthorizedError = async (error: AxiosError) => {
	const originalRequest = error.config as AxiosRequestConfigWithRetry

	if (error?.response?.status !== 401) return Promise.reject(error)

	if (originalRequest._retry && originalRequest._retry >= MAX_RETRIES) {
		await authService.logout()

		setTimeout(() => {
			window.location.href = '/login'
		}, 100)

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

		setTimeout(() => {
			window.location.href = '/login'
		}, 100)

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
		const { accessToken } = getTokens()
		if (accessToken) {
			config.headers = config.headers || {}
			config.headers.Authorization = `Bearer ${accessToken}`
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
