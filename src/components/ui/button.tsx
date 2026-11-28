import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'rounded-full bg-primary px-6 py-2.5 text-on-primary shadow-sm hover:bg-primary-hover hover:shadow-md',
        secondary:
          'rounded-full bg-secondary-container px-6 py-2.5 text-on-secondary-container hover:bg-secondary-container-hover',
        destructive: 'rounded-full bg-error px-6 py-2.5 text-white hover:bg-error-hover',
        outline:
          'rounded-full border border-outline bg-surface px-6 py-2.5 text-primary hover:bg-primary-container',
        ghost: 'rounded-full px-6 py-2.5 text-primary hover:bg-primary-container',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: '',
        sm: 'px-4 py-1.5 text-xs',
        lg: 'px-8 py-3',
        icon: 'h-10 w-10 p-0',
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
