import { cn } from '@/lib/utils'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import * as React from 'react'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	const [showPassword, setShowPassword] = React.useState(false)
	const isPassword = type === 'password'

	return (
		<div className='relative w-full'>
			<input
				type={isPassword && showPassword ? 'text' : type}
				data-slot='input'
				className={cn(
					'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
					'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
					className
				)}
				{...props}
			/>
			{isPassword && (
				<button
					type='button'
					className='text-muted-foreground absolute inset-y-0 right-2 flex items-center'
					onClick={() => setShowPassword(!showPassword)}
				>
					{showPassword ? <EyeIcon size={16} /> : <EyeOffIcon size={16} />}
				</button>
			)}
		</div>
	)
}

export { Input }
