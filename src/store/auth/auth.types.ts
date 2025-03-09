export interface AuthStore {
	isAuthenticated: boolean
	token: string | null
	setIsAuthenticated: (isAuthenticated: boolean, token: string | null) => void
	logout: () => void
}
