import { AxiosRequestConfig } from 'axios'

export interface AuthResponse {
	accessToken: string
	refreshToken: string
}

export interface AxiosRequestConfigExtended extends AxiosRequestConfig {
	_retry?: number
	_logout?: boolean
}
