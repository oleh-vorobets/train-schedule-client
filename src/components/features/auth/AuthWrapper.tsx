import Image from 'next/image'
import Link from 'next/link'
import React, { PropsWithChildren } from 'react'

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card'

interface AuthWrapperProps {
	heading: string
	description: string
	imageSrc: string
	backButtonLabel?: string
	backButtonHref?: string
}

export const AuthWrapper: React.FC<PropsWithChildren<AuthWrapperProps>> = ({
	heading,
	description,
	children,
	imageSrc,
	backButtonHref,
	backButtonLabel
}) => {
	return (
		<div className='flex h-screen items-center justify-center'>
			<Card className='flex flex-row items-center gap-x-4 rounded-2xl p-4 lg:gap-x-10'>
				<div className='flex h-full flex-col items-center justify-center'>
					<CardHeader className='mb-8 text-center'>
						<CardTitle className='text-3xl lg:text-5xl'>{heading}</CardTitle>
						<CardDescription className='text-muted-foreground text-sm lg:text-base'>
							{description}
						</CardDescription>
					</CardHeader>
					<CardContent className='w-full px-6 lg:px-16'>{children}</CardContent>
					<CardFooter className='mt-4'>
						{backButtonHref && backButtonLabel && (
							<Link
								href={backButtonHref}
								className='hover:text-muted-foreground text-sm duration-200'
							>
								{backButtonLabel}
							</Link>
						)}
					</CardFooter>
				</div>
				<div className='hidden overflow-hidden rounded-2xl sm:block'>
					<Image
						alt='Train'
						src={imageSrc}
						width={500}
						height={800}
						className='rounded-2xl object-cover transition-all duration-500 ease-in-out hover:scale-110'
					/>
				</div>
			</Card>
		</div>
	)
}
