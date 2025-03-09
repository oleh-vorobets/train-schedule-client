'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { PropsWithChildren, useState } from 'react'

function QueryProvider({ children }: PropsWithChildren) {
	const [queryClient] = useState(() => new QueryClient())
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}

export default QueryProvider
