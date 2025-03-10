import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/signup']
const PROTECTED_REDIRECT = '/schedule'
const LOGIN_REDIRECT = '/login'
const API_VALIDATE_TOKEN = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/me`

export async function middleware(req: NextRequest) {
	const accessToken = req.cookies.get('accessToken')?.value
	const refreshToken = req.cookies.get('refreshToken')?.value

	const { pathname } = req.nextUrl
	const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

	let isAuthenticated = false
	if (accessToken && refreshToken) {
		try {
			const response = await fetch(API_VALIDATE_TOKEN, {
				headers: { Authorization: `Bearer ${accessToken}` },
				credentials: 'include'
			})

			if (response.ok) {
				isAuthenticated = true
			}
		} catch (error) {
			console.error('Token validation error:', error)
		}
	}

	if (isAuthenticated && isPublicRoute) {
		return NextResponse.redirect(new URL(PROTECTED_REDIRECT, req.url))
	}

	if (!isAuthenticated && !isPublicRoute) {
		return NextResponse.redirect(new URL(LOGIN_REDIRECT, req.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next|favicon.ico|api/auth/refresh).*)']
}
