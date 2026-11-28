import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-t border-0 border-b-2 bg-surface-container px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-0',
        error ? 'border-error' : 'border-outline',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
