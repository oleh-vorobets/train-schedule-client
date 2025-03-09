'use client'

import { ScheduleModal } from '../modal/ScheduleModal'
import { scheduleService } from '@/services/schedule/schedule.service'
import { ScheduleRequest, ScheduleResponse } from '@/services/schedule/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

import { ConfirmModal } from '@/components/common/modals/ConfirmModal'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'

import { TScheduleSchema } from '@/schemas/schedule/schedule.schema'

import { formatDate, formatTime } from '@/utils/format'

interface ScheduleTable {
	schedules: ScheduleResponse[]
}

export const ScheduleTable: React.FC<ScheduleTable> = ({ schedules }) => {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [selectedSchedule, setSelectedSchedule] =
		useState<ScheduleResponse | null>(null)

	const queryClient = useQueryClient()

	const updateMutation = useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: ScheduleRequest }) =>
			scheduleService.update(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['schedule'] })
			toast.success('Schedule has been successfully updated.')
			setIsEditDialogOpen(false)
			setSelectedSchedule(null)
		},
		onError: error => {
			toast.error('Failed to update schedule.')
		}
	})

	const deleteMutation = useMutation({
		mutationFn: scheduleService.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['schedule'] })
			toast.success('Schedule has been successfully deleted.')
			setSelectedSchedule(null)
		},
		onError: error => {
			toast.error('Failed to delete schedule.')
		}
	})

	const handleDelete = (id: string) => {
		deleteMutation.mutate(id)
	}

	const handleEdit = (formData: TScheduleSchema) => {
		if (selectedSchedule) {
			updateMutation.mutate({
				id: selectedSchedule.id,
				payload: {
					...formData,
					trainNumber: selectedSchedule.trainNumber,
					arrivalTime: new Date(formData.arrivalTime).toISOString(),
					startTime: new Date(formData.startTime).toISOString()
				}
			})
		}
	}

	const handleOpenEditDialog = (schedule: ScheduleResponse) => {
		setSelectedSchedule(schedule)
		setIsEditDialogOpen(true)
	}

	const handleCloseEditDialog = () => {
		setIsEditDialogOpen(false)
	}

	return (
		<>
			<div className='overflow-hidden rounded-md border border-gray-700'>
				<Table className='bg-gray-900 text-white'>
					<TableHeader className='bg-gray-800'>
						<TableRow>
							<TableHead className='text-yellow-text'>Train #</TableHead>
							<TableHead className='text-yellow-text'>Date</TableHead>
							<TableHead className='text-yellow-text'>Departure</TableHead>
							<TableHead className='text-yellow-text'>From</TableHead>
							<TableHead className='text-yellow-text'>Arrival</TableHead>
							<TableHead className='text-yellow-text'>To</TableHead>
							<TableHead className='text-primary-foreground'>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{schedules.map(schedule => (
							<TableRow
								key={schedule.id}
								className='border-gray-700 hover:bg-gray-800'
							>
								<TableCell className='font-bold'>
									{schedule.trainNumber}
								</TableCell>
								<TableCell>{formatDate(schedule.startTime)}</TableCell>
								<TableCell>{formatTime(schedule.startTime)}</TableCell>
								<TableCell>{schedule.from}</TableCell>
								<TableCell>{formatTime(schedule.arrivalTime)}</TableCell>
								<TableCell>{schedule.to}</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger>
											<MoreHorizontal className='cursor-pointer' />
										</DropdownMenuTrigger>
										<DropdownMenuContent className='bg-gray-800'>
											<DropdownMenuItem
												onClick={() => handleOpenEditDialog(schedule)}
												className='flex flex-row items-center gap-2'
											>
												<Pencil className='text-primary-foreground' />
												<span className='text-primary-foreground'>Edit</span>
											</DropdownMenuItem>
											<DropdownMenuItem onSelect={e => e.preventDefault()}>
												<ConfirmModal
													heading='Are you absolutely sure?'
													message='This action cannot be undone. This will permanently delete your
							schedule from our servers.'
													onConfirm={() => handleDelete(schedule.id)}
												>
													<div className='flex flex-row items-center gap-2'>
														<Trash className='text-red-500' />
														<span className='text-red-500'>Delete</span>
													</div>
												</ConfirmModal>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{isEditDialogOpen && selectedSchedule && (
				<ScheduleModal
					description='Enter the details for the existing train schedule.'
					title='Edit Schedule'
					isOpen={isEditDialogOpen}
					setIsOpen={handleCloseEditDialog}
					onSubmit={handleEdit}
					submitButtonText='Edit Schedule'
					defaultValues={{
						arrivalTime: selectedSchedule.arrivalTime.slice(0, 16),
						startTime: selectedSchedule.startTime.slice(0, 16),
						from: selectedSchedule.from,
						to: selectedSchedule.to,
						trainNumber: selectedSchedule.trainNumber
					}}
				/>
			)}
		</>
	)
}
