'use client'

import { AuthWrapper } from '../AuthWrapper'
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

import { TSignupSchema, signupSchema } from '@/schemas/auth/signup.schema'

import { useAuthStore } from '@/store/auth/auth.store'

export const SignupForm = () => {
	const router = useRouter()

	const setIsAuthenticated = useAuthStore(state => state.setIsAuthenticated)

	const form = useForm<TSignupSchema>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			email: '',
			password: '',
			repeatPassword: ''
		}
	})

	const { mutate, isPending } = useMutation({
		mutationFn: (payload: {
			email: string
			password: string
			repeatPassword: string
		}) => authService.signup(payload),
		onSuccess: response => {
			setIsAuthenticated(true, response.accessToken)
			toast.success('You are successfully registered!')
			router.push('/schedule')
		},
		onError: (error: AxiosError<{ message: string }>) => {
			if (error.status! < 500 && error.response?.data?.message) {
				toast.error(error.response?.data?.message)
			} else {
				toast.error('Something went wrong. Try again later.')
			}
		}
	})

	function onSubmit(data: TSignupSchema) {
		mutate(data)
	}

	const {
		email: emailError,
		password: passwordError,
		repeatPassword: repeatPasswordError
	} = form.formState.errors

	return (
		<AuthWrapper
			description='Create a new account by entering your email and password'
			heading='Join Us'
			imageSrc='https://images.unsplash.com/photo-1589196728426-4613a4992c42?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
			backButtonHref='/login'
			backButtonLabel='Already have an account?'
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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
					<FormField
						control={form.control}
						name='repeatPassword'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Repeat Password</FormLabel>
								<FormControl>
									<Input
										placeholder='********'
										{...field}
										type='password'
										disabled={isPending}
									/>
								</FormControl>
								{repeatPasswordError && (
									<span className='text-sm text-red-500'>
										{repeatPasswordError.message}
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
						Sign Up
					</Button>
				</form>
			</Form>
		</AuthWrapper>
	)
}
