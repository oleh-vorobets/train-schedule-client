import { Metadata } from 'next'
import React from 'react'

import { SignupForm } from '@/components/features/auth/forms/SignupForm'

export const metadata: Metadata = {
	title: 'Sign up!'
}

const SignupPage = () => {
	return <SignupForm />
}

export default SignupPage
