import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-medium transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'my-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-secondary',
        secondary: 'rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300',
        destructive: 'rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700',
        outline:
          'rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-50',
        ghost: 'rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: '',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-6 py-3',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
