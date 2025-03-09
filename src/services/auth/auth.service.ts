import { AuthResponse } from './types'
import { API_ROUTES } from '@/constants/route.constants'
import { api } from '@/lib/axios'

export const authService = {
	login: async (payload: { email: string; password: string }) => {
		const { data } = await api.post<AuthResponse>(
			API_ROUTES.AUTH.LOGIN,
			payload,
			{ withCredentials: true }
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
			payload,
			{ withCredentials: true }
		)
		return data
	},

	logout: async () => {
		return await api.get<void>(API_ROUTES.AUTH.LOGOUT, {
			withCredentials: true
		})
	},

	refresh: async () => {
		const { data } = await api.get<AuthResponse>(API_ROUTES.AUTH.REFRESH, {
			withCredentials: true
		})
		return data
	}
}
