import { z } from 'zod'

export const signupSchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(8),
		repeatPassword: z.string().min(8)
	})
	.refine(data => data.password === data.repeatPassword, {
		path: ['repeatPassword']
	})

export type TSignupSchema = z.infer<typeof signupSchema>
