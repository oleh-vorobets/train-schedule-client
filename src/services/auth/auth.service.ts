import { AuthResponse, AxiosRequestConfigExtended } from './types'
import { API_ROUTES } from '@/constants/route.constants'
import { api, deleteTokens } from '@/lib/axios'

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
		deleteTokens()
		await api.get<void>(API_ROUTES.AUTH.LOGOUT)
		return true
	},

	refresh: async (logout: boolean = false) => {
		const { data } = await api.get<AuthResponse>(API_ROUTES.AUTH.REFRESH, {
			withCredentials: true,
			_logout: logout
		} as AxiosRequestConfigExtended)

		return data
	}
}
