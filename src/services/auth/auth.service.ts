import { AuthResponse } from './types'
import { API_ROUTES } from '@/constants/route.constants'
import { api } from '@/lib/axios'
import { cookies } from 'next/headers'

export const authService = {
	login: async (payload: { email: string; password: string }) => {
		const response = await api.post<AuthResponse>(
			API_ROUTES.AUTH.LOGIN,
			payload
		)

		const setCookieHeaders = response.headers['set-cookie']
		if (setCookieHeaders) {
			setCookieHeaders.forEach(async cookie => {
				const [keyValue, ...options] = cookie.split('; ')
				const [key, value] = keyValue.split('=')
				;(await cookies()).set(key, value, {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: process.env.NODE_ENV === 'production'
				})
			})
		}

		return response.data
	},

	signup: async (payload: {
		email: string
		password: string
		repeatPassword: string
	}) => {
		const response = await api.post<AuthResponse>(
			API_ROUTES.AUTH.SIGNUP,
			payload
		)

		const setCookieHeaders = response.headers['set-cookie']
		if (setCookieHeaders) {
			setCookieHeaders.forEach(async cookie => {
				const [keyValue, ...options] = cookie.split('; ')
				const [key, value] = keyValue.split('=')
				;(await cookies()).set(key, value, {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: process.env.NODE_ENV === 'production'
				})
			})
		}

		return response.data
	},

	logout: async () => {
		;(await cookies()).delete('refreshToken')
		return await api.get<void>(API_ROUTES.AUTH.LOGOUT)
	},

	refresh: async () => {
		const refreshToken = (await cookies()).get('refreshToken')?.value

		const { data } = await api.get<AuthResponse>(API_ROUTES.AUTH.REFRESH, {
			headers: {
				Cookie: `refreshToken=${refreshToken}`
			},
			withCredentials: true
		})
		return data
	}
}
