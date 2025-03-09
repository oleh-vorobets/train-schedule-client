import Link from 'next/link'

export default function NotFoundPage() {
	return (
		<div className='flex h-screen flex-col items-center justify-center bg-gray-100 text-gray-900'>
			<h1 className='text-6xl font-bold'>404</h1>
			<p className='mt-4 text-xl'>Page Not Found</p>
			<Link
				href='/'
				className='mt-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
			>
				Go Home
			</Link>
		</div>
	)
}
