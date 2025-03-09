import { Metadata } from 'next'
import React from 'react'

import { LoginForm } from '@/components/features/auth/forms/LoginForm'

export const metadata: Metadata = {
	title: 'Login!'
}

const LoginPage = () => {
	return <LoginForm />
}

export default LoginPage
