import { AuthResponse } from './types'
import { API_ROUTES } from '@/constants/route.constants'
import { api } from '@/lib/axios'
import Cookies from 'js-cookie'

export const authService = {
	login: async (payload: { email: string; password: string }) => {
		const { data } = await api.post<AuthResponse>(
			API_ROUTES.AUTH.LOGIN,
			payload
		)

		return data
	},

	signup: async (payload: {
		email: string
		password: string
		repeatPassword: string
	}) => {
		const { data } = await api.post<AuthResponse>(
			API_ROUTES.AUTH.SIGNUP,
			payload
		)
		return data
	},

	logout: async () => {
		Cookies.set('accessToken', '', {
			path: '/',
			expires: new Date()
		})
		Cookies.set('refreshToken', '', {
			path: '/',
			expires: new Date()
		})

		Cookies.remove('refreshToken')
		Cookies.remove('accessToken')
		await api.get<void>(API_ROUTES.AUTH.LOGOUT)
		return true
	},

	refresh: async () => {
		const { data } = await api.get<AuthResponse>(API_ROUTES.AUTH.REFRESH, {
			withCredentials: true
		})
		return data
	}
}
