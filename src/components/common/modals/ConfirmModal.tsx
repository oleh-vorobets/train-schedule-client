import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '../../ui/alert-dialog'
import type { PropsWithChildren } from 'react'

interface ConfirmModalProps {
	heading: string
	message: string
	onConfirm: () => void
}

export function ConfirmModal({
	children,
	heading,
	message,
	onConfirm
}: PropsWithChildren<ConfirmModalProps>) {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent className='bg-gray-900 text-white'>
				<AlertDialogHeader>
					<AlertDialogTitle className='text-yellow-text text-2xl'>
						{heading}
					</AlertDialogTitle>
					<AlertDialogDescription className='text-base text-gray-400'>
						{message}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className='bg-yellow-text cursor-pointer text-black hover:bg-yellow-500'
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
