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
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500"
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
          className="w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm font-medium text-gray-800 shadow-sm transition-all hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <option value="weighted-sgpa">Weighted SGPA [ Σ(SGPA × w) / Σw ]</option>
          <option value="credit-weighted">
            Weighted Module CGPA [ Σ(w × C × GPV) / Σ(w × C) ]
          </option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
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
      <span className="text-[11px] text-gray-400">
        {method === 'credit-weighted'
          ? 'CGPA: Weighted by module credits and semester weightage (NGPA excluded)'
          : 'Overall GPA: Weighted average of semester SGPAs (NGPA excluded)'}
      </span>
    </div>
  )
}
