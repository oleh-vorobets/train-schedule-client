import { Metadata } from 'next'
import React from 'react'

import { ScheduleContent } from '@/components/features/schedule/ScheduleContent'

export const metadata: Metadata = {
	title: 'Train schedules'
}

const SchedulePage = () => {
	return <ScheduleContent />
}

export default SchedulePage
