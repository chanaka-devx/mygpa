import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'mt-1 block w-full rounded-t border-0 border-b-2 border-outline bg-surface-container p-4 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-0',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
