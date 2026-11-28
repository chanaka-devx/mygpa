import { Calculator } from 'lucide-react'
import type { GpaMethod } from '@/features/gpa/types'

interface MethodSelectorProps {
  method: GpaMethod
  onChange: (method: GpaMethod) => void
  disabled?: boolean
}

export function MethodSelector({ method, onChange, disabled = false }: MethodSelectorProps) {
  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <label
        htmlFor="gpa-calc-method"
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
      >
        <Calculator className="h-3.5 w-3.5 text-primary" />
        GPA Calculation Method
      </label>
      <div className="relative inline-block w-full sm:w-auto">
        <select
          id="gpa-calc-method"
          value={method}
          onChange={(event) => onChange(event.target.value as GpaMethod)}
          disabled={disabled}
          className="w-full cursor-pointer appearance-none rounded-full border border-outline bg-surface py-2.5 pl-4 pr-10 text-sm font-medium text-on-surface transition-all hover:bg-surface-container focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <option value="weighted-sgpa">Weighted SGPA [ Σ(SGPA × w) / Σw ]</option>
          <option value="credit-weighted">
            Weighted Module CGPA [ Σ(w × C × GPV) / Σ(w × C) ]
          </option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      <span className="text-[11px] text-on-surface-variant">NGPA modules are excluded.</span>
    </div>
  )
}
