'use client'

import { AuthWrapper } from '../AuthWrapper'
import { saveTokens } from '@/lib/axios'
import { authService } from '@/services/auth/auth.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { TLoginSchema, loginSchema } from '@/schemas/auth/login.schema'

export const LoginForm = () => {
	const router = useRouter()

	const form = useForm<TLoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (payload: { email: string; password: string }) =>
			authService.login(payload),
		onSuccess: response => {
			saveTokens(response.accessToken, response.refreshToken)
			toast.success('You are successfully logged in!')
			router.push('/schedule')
		},
		onError: (error: AxiosError<{ message: string }>) => {
			console.log(error)
			if (error.status! < 500 && error.response?.data?.message) {
				toast.error(error.response?.data?.message)
			} else {
				toast.error('Something went wrong. Try again later.')
			}
		}
	})

	function onSubmit(data: TLoginSchema) {
		mutate(data)
	}
	const { email: emailError, password: passwordError } = form.formState.errors

	return (
		<AuthWrapper
			description='Enter your password and email to access your account'
			heading='Welcome Back'
			imageSrc='https://images.unsplash.com/photo-1601999007938-f584b47324ac?q=80&w=2638&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
			backButtonHref='/signup'
			backButtonLabel="Don't have an account?"
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
					<FormField
						control={form.control}
						name='email'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										placeholder='joedoe@mail.com'
										{...field}
										disabled={isPending}
									/>
								</FormControl>
								{emailError && (
									<span className='text-sm text-red-500'>
										{emailError.message}
									</span>
								)}
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input
										placeholder='********'
										{...field}
										type='password'
										disabled={isPending}
									/>
								</FormControl>
								{passwordError && (
									<span className='text-sm text-red-500'>
										{passwordError.message}
									</span>
								)}
							</FormItem>
						)}
					/>
					<Button
						type='submit'
						className='w-full cursor-pointer'
						disabled={isPending}
					>
						Login
					</Button>
				</form>
			</Form>
		</AuthWrapper>
	)
}
