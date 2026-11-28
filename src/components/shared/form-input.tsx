import type { InputHTMLAttributes } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
  error?: string
}

export function FormInput({ name, label, error, id, ...props }: FormInputProps) {
  const inputId = id || name
  return (
    <div>
      {label !== undefined && (
        <Label htmlFor={inputId} className="mb-1">
          {label}
        </Label>
      )}
      <Input id={inputId} name={name} error={Boolean(error)} {...props} />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
}
