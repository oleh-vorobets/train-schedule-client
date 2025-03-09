import { ScheduleFilters } from '@/services/schedule/types'

export const API_ROUTES = {
	AUTH: {
		LOGIN: '/auth/login',
		SIGNUP: '/auth/signup',
		REFRESH: '/auth/refresh',
		LOGOUT: '/auth/logout'
	},
	SCHEDULE: {
		GET_ALL: (filters: ScheduleFilters = {}) => {
			const queryParams: string[] = []

			if (filters.skip !== undefined) queryParams.push(`skip=${filters.skip}`)
			if (filters.take !== undefined) queryParams.push(`take=${filters.take}`)
			if (filters.searchTerm)
				queryParams.push(`searchTerm=${encodeURIComponent(filters.searchTerm)}`)
			if (filters.sortBy) queryParams.push(`sortBy=${filters.sortBy}`)
			if (filters.sortOrder) queryParams.push(`sortOrder=${filters.sortOrder}`)

			const queryString =
				queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

			return `/schedule${queryString}`
		},
		CREATE: '/schedule',
		DELETE: (id: string) => `/schedule/${id}`,
		UPDATE: (id: string) => `/schedule/${id}`
	}
}
