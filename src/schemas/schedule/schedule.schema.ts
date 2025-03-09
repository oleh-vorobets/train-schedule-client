import { z } from 'zod'

export const scheduleSchema = z
	.object({
		from: z.string().min(2).max(50),
		to: z.string().min(2).max(50),
		startTime: z.string(),
		arrivalTime: z.string(),
		trainNumber: z.string().length(4).optional().nullable()
	})
	.refine(data => data.startTime < data.arrivalTime)

export type TScheduleSchema = z.infer<typeof scheduleSchema>
