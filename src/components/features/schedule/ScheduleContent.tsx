'use client'

import { ScheduleModal } from './modal/ScheduleModal'
import { ScheduleTable } from './table/ScheduleTable'
import { ScheduleTableSkeleton } from './table/ScheduleTableSkeleton'
import { deleteTokens } from '@/lib/axios'
import { authService } from '@/services/auth/auth.service'
import { scheduleService } from '@/services/schedule/schedule.service'
import { ScheduleFilters } from '@/services/schedule/types'
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient
} from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'

import { TScheduleSchema } from '@/schemas/schedule/schedule.schema'

export const ScheduleContent = () => {
	const [inputValue, setInputValue] = useState('')
	const [searchTerm, setSearchTerm] = useState('')

	const [sortBy, setSortBy] = useState<ScheduleFilters['sortBy']>('startTime')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
	const { ref, inView } = useInView()

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

	const queryClient = useQueryClient()

	const ITEMS_PER_PAGE = 10

	const router = useRouter()

	const fetchSchedules = async ({ pageParam = 0 }) => {
		const filters: ScheduleFilters = {
			skip: pageParam * ITEMS_PER_PAGE,
			take: ITEMS_PER_PAGE,
			searchTerm: searchTerm.length > 0 ? searchTerm : undefined,
			sortBy,
			sortOrder
		}
		return await scheduleService.getAll(filters)
	}

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isPending,
		isLoading,
		isError,
		error
	} = useInfiniteQuery({
		queryKey: ['schedule', searchTerm, sortBy, sortOrder],
		queryFn: fetchSchedules,
		getNextPageParam: (lastPage, allPages) => {
			return lastPage.length === ITEMS_PER_PAGE ? allPages.length : undefined
		},
		initialPageParam: 0
	})

	const createMutation = useMutation({
		mutationFn: scheduleService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['schedule'] })
			toast.success('Schedule has been successfully created.')
			setIsAddDialogOpen(false)
		},
		onError: () => {
			toast.error('Failed to create schedule.')
		}
	})

	const logoutMutation = useMutation({
		mutationFn: authService.logout,
		onSuccess: () => {
			deleteTokens()
			toast.success('You are successfully logged out.')
			router.push('/login')
		},
		onError: () => {
			toast.error('Failed to log out, please try again.')
		}
	})

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	const schedules = data?.pages.flat() || []

	const openAddDialog = () => {
		setIsAddDialogOpen(true)
	}

	const handleCreateSubmit = (formData: TScheduleSchema) => {
		const trainNumber = Math.random().toString(36).substring(2, 6).toUpperCase() // Generates alphanumeric
		createMutation.mutate({
			...formData,
			trainNumber,
			arrivalTime: formData.arrivalTime,
			startTime: formData.startTime
		})
	}

	const isLoadingOrEmpty = isLoading || isPending

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			setSearchTerm(inputValue)
		}
	}

	return (
		<main className='min-h-screen w-full bg-black p-6'>
			<div className='mb-6 flex flex-row items-center justify-between'>
				<h1 className='text-yellow-text text-4xl font-medium lg:text-7xl'>
					TRAIN DEPARTURES
				</h1>
				<div className='flex flex-row items-center gap-x-4'>
					<Button variant='outline' onClick={openAddDialog}>
						<Plus className='text-primary-foreground' />
					</Button>
					<Button variant='default' onClick={() => logoutMutation.mutate()}>
						Log out
					</Button>
				</div>
			</div>

			<div className='mb-6 flex gap-4'>
				<Input
					placeholder='Search schedules...'
					value={inputValue}
					onChange={e => setInputValue(e.target.value)}
					onKeyDown={handleKeyPress}
					className='max-w-sm border-gray-700 bg-gray-900 text-white'
				/>

				<Select
					value={sortBy}
					onValueChange={(value: string) =>
						setSortBy(value as ScheduleFilters['sortBy'])
					}
				>
					<SelectTrigger className='w-[180px] border-gray-700 bg-gray-900 text-white'>
						<SelectValue placeholder='Sort by' />
					</SelectTrigger>
					<SelectContent className='border-gray-700 bg-gray-900 text-white'>
						<SelectItem value='trainNumber'>Train Number</SelectItem>
						<SelectItem value='startTime'>Departure Time</SelectItem>
						<SelectItem value='arrivalTime'>Arrival Time</SelectItem>
						<SelectItem value='from'>Departure Station</SelectItem>
						<SelectItem value='to'>Arrival Station</SelectItem>
					</SelectContent>
				</Select>

				<Select
					value={sortOrder}
					onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}
				>
					<SelectTrigger className='w-[180px] border-gray-700 bg-gray-900 text-white'>
						<SelectValue placeholder='Sort order' />
					</SelectTrigger>
					<SelectContent className='border-gray-700 bg-gray-900 text-white'>
						<SelectItem value='asc'>Ascending</SelectItem>
						<SelectItem value='desc'>Descending</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{isError ? (
				<div className='text-xl text-red-500'>
					Error: {(error as Error).message}
				</div>
			) : isLoadingOrEmpty ? (
				<ScheduleTableSkeleton />
			) : (
				<ScheduleTable schedules={schedules} />
			)}

			{!isPending && !isError && (
				<div ref={ref} className='text-yellow-text mt-4 py-4 text-center'>
					{isFetchingNextPage
						? 'Loading more...'
						: hasNextPage
							? 'Scroll for more'
							: 'No more trains'}
				</div>
			)}

			<ScheduleModal
				description='Enter the details for the new train schedule.'
				title='	Add New Train'
				isOpen={isAddDialogOpen}
				setIsOpen={setIsAddDialogOpen}
				onSubmit={handleCreateSubmit}
				submitButtonText='Add Schedule'
			/>
		</main>
	)
}
