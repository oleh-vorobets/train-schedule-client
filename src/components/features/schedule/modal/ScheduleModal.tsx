import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import {
	TScheduleSchema,
	scheduleSchema
} from '@/schemas/schedule/schedule.schema'

interface ScheduleModalProps {
	onSubmit: (schedule: TScheduleSchema) => void
	isOpen: boolean
	setIsOpen: (v: boolean) => void
	title: string
	description: string
	submitButtonText: string
	defaultValues?: TScheduleSchema
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
	isOpen,
	onSubmit,
	setIsOpen,
	description,
	title,
	submitButtonText,
	defaultValues
}) => {
	const form = useForm<TScheduleSchema>({
		resolver: zodResolver(scheduleSchema),
		defaultValues: defaultValues ?? {
			arrivalTime: '',
			startTime: '',
			from: '',
			to: '',
			trainNumber: null
		}
	})

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className='bg-gray-900 text-white'>
				<DialogHeader>
					<DialogTitle className='text-yellow-text'>{title}</DialogTitle>
					<DialogDescription className='text-gray-400'>
						{description}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className='flex flex-col space-y-6'>
							<div className='flex w-full flex-col gap-4 lg:flex-row'>
								<FormField
									control={form.control}
									name='from'
									render={({ field }) => (
										<FormItem className='w-full'>
											<FormLabel>From</FormLabel>
											<FormControl>
												<Input placeholder='Lisabon' {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='to'
									render={({ field }) => (
										<FormItem className='w-full'>
											<FormLabel>To</FormLabel>
											<FormControl>
												<Input placeholder='Berlin' {...field} />
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
							<div className='flex w-full flex-col gap-4 lg:flex-row'>
								<FormField
									control={form.control}
									name='startTime'
									render={({ field }) => (
										<FormItem className='w-full'>
											<FormLabel>Starting at</FormLabel>
											<FormControl>
												<Input
													placeholder='01.01.2025, 12:00'
													{...field}
													type='datetime-local'
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='arrivalTime'
									render={({ field }) => (
										<FormItem className='w-full'>
											<FormLabel>Arrival at</FormLabel>
											<FormControl>
												<Input
													placeholder='01.01.2025, 18:00'
													{...field}
													type='datetime-local'
													className='w-full'
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						</div>

						<DialogFooter className='mt-8'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setIsOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type='submit'
								className='bg-yellow-text text-black hover:bg-yellow-500'
								disabled={!form.formState.isValid}
							>
								{submitButtonText}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
