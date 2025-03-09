import React from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'

export const ScheduleTableSkeleton = () => {
	const skeletonRows = Array.from({ length: 30 }, (_, index) => index)

	return (
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
					{skeletonRows.map(index => (
						<TableRow key={index} className='border-gray-700'>
							<TableCell>
								<Skeleton className='h-5 w-16 bg-gray-800' />
							</TableCell>
							<TableCell>
								<Skeleton className='h-5 w-24 bg-gray-800' />
							</TableCell>
							<TableCell>
								<Skeleton className='h-5 w-14 bg-gray-800' />
							</TableCell>
							<TableCell>
								<Skeleton className='h-5 w-28 bg-gray-800' />
							</TableCell>
							<TableCell>
								<Skeleton className='h-5 w-14 bg-gray-800' />
							</TableCell>
							<TableCell>
								<Skeleton className='h-5 w-28 bg-gray-800' />
							</TableCell>
							<TableCell>
								<Skeleton className='h-5 w-8 bg-gray-800' />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
