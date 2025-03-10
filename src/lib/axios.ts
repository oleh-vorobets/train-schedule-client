import { authService } from '@/services/auth/auth.service'
import { AxiosRequestConfigExtended } from '@/services/auth/types'
import axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie'

const MAX_RETRIES = 1
let isRefreshing = false
let refreshQueue: ((token: string) => void)[] = []

export const saveTokens = (accessToken?: string, refreshToken?: string) => {
	if (accessToken) {
		localStorage.setItem('accessToken', accessToken)
		Cookies.set('accessToken', accessToken, {
			expires: 0.0104, // 15 minutes
			path: '/'
		})
	}
	if (refreshToken) {
		localStorage.setItem('refreshToken', refreshToken)
		Cookies.set('refreshToken', refreshToken, { expires: 7, path: '/' })
	}
}

export const deleteTokens = () => {
	localStorage.removeItem('accessToken')
	localStorage.removeItem('refreshToken')

	Cookies.set('accessToken', '', {
		expires: 0.0001,
		path: '/'
	})

	Cookies.set('refreshToken', '', { expires: 0.0001, path: '/' })

	Cookies.remove('accessToken', { path: '/' })
	Cookies.remove('refreshToken', { path: '/' })
}

export const getTokens = () => {
	const accessToken =
		localStorage.getItem('accessToken') || Cookies.get('accessToken')
	const refreshToken =
		localStorage.getItem('refreshToken') || Cookies.get('refreshToken')
	return { accessToken, refreshToken }
}

const logout = async () => {
	await authService.logout()
	deleteTokens()
	window.location.reload()
}

const refreshToken = async (logout: boolean = false): Promise<string> => {
	if (isRefreshing) {
		return new Promise(resolve => {
			refreshQueue.push(resolve)
		})
	}

	isRefreshing = true
	try {
		const response = await authService.refresh(logout)

		if (!response) {
			throw new Error('No response from server')
		}

		if (!response?.accessToken) {
			throw new Error('No access token received')
		}

		const newToken = response.accessToken
		saveTokens(newToken, response.refreshToken)

		refreshQueue.forEach(resolve => resolve(newToken))
		refreshQueue = []

		return newToken
	} catch {
		refreshQueue.forEach(resolve => resolve(''))
		refreshQueue = []
		throw new Error('Token refresh failed')
	} finally {
		refreshQueue.forEach(resolve => resolve(''))
		refreshQueue = []
		isRefreshing = false
	}
}

const handleUnauthorizedError = async (error: AxiosError) => {
	const originalRequest = error.config as AxiosRequestConfigExtended

	if (error?.response?.status !== 401) {
		return Promise.reject(error)
	}

	//if logout attribute in config logout user after 401 erorr
	if (
		(originalRequest._retry && originalRequest._retry >= MAX_RETRIES) ||
		originalRequest._logout
	) {
		logout()
	}

	originalRequest._retry = (originalRequest._retry || 0) + 1

	try {
		const newToken = await refreshToken(true)

		if (!newToken) {
			logout()
		}

		originalRequest.headers = originalRequest.headers || {}
		originalRequest.headers.Authorization = `Bearer ${newToken}`
		return api(originalRequest)
	} catch (refreshError) {
		logout()
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
