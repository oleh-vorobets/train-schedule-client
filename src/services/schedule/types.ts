export interface ScheduleResponse {
	id: string
	from: string
	to: string
	startTime: string
	arrivalTime: string
	trainNumber: string
	createdAt: Date
	updatedAt: Date
}

export type ScheduleRequest = Partial<
	Omit<ScheduleResponse, 'createdAt' | 'updatedAt' | 'id'>
>

export interface ScheduleFilters {
	skip?: number
	take?: number
	searchTerm?: string
	sortBy?: keyof ScheduleRequest
	sortOrder?: 'asc' | 'desc'
}
