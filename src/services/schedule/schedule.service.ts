import { ScheduleFilters, ScheduleRequest, ScheduleResponse } from './types'
import { API_ROUTES } from '@/constants/route.constants'
import { api } from '@/lib/axios'

export const scheduleService = {
	getAll: async (filters?: ScheduleFilters) => {
		const { data } = await api.get<ScheduleResponse[]>(
			API_ROUTES.SCHEDULE.GET_ALL(filters)
		)
		return data
	},
	delete: async (id: string) => {
		return await api.delete(API_ROUTES.SCHEDULE.DELETE(id))
	},
	update: async (id: string, payload: ScheduleRequest) => {
		const { data } = await api.patch(API_ROUTES.SCHEDULE.UPDATE(id), payload)
		return data
	},
	create: async (payload: ScheduleRequest) => {
		const { data } = await api.post(API_ROUTES.SCHEDULE.CREATE, payload)
		return data
	}
}
