import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/signup']
const PROTECTED_REDIRECT = '/schedule'
const LOGIN_REDIRECT = '/login'

export function middleware(req: NextRequest) {
	const accessToken = req.cookies.get('accessToken')?.value
	const { pathname } = req.nextUrl

	const isAuthenticated = !!accessToken
	const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

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
