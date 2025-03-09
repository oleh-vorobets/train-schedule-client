import { format } from 'date-fns'

export const formatTime = (dateString: string) => {
	const date = new Date(dateString)
	return format(date, 'HH:mm')
}

export const formatDate = (dateString: string) => {
	const date = new Date(dateString)
	return format(date, 'dd MMM yyyy')
}
