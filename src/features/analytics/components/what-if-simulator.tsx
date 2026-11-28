import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { calculateProjection, getMaxGradePoint } from '@/features/gpa/calculations'
import type {
  GradePoint,
  GpaMethod,
  HypotheticalSemester,
  SemesterWithStats,
} from '@/features/gpa/types'

interface WhatIfSimulatorProps {
  semesters: SemesterWithStats[]
  gradeList: GradePoint[]
  currentOverallGpa: number
  currentTotalCredits: number
  gpaMethod: GpaMethod
}

export function WhatIfSimulator({
  semesters,
  gradeList,
  currentOverallGpa,
  currentTotalCredits,
  gpaMethod,
}: WhatIfSimulatorProps) {
  const [hypotheticals, setHypotheticals] = useState<HypotheticalSemester[]>([])
  const maxPoint = getMaxGradePoint(gradeList)
  const projection = calculateProjection(
    semesters,
    gradeList,
    currentOverallGpa,
    currentTotalCredits,
    gpaMethod,
    hypotheticals,
  )

  const addHypothetical = () => {
    setHypotheticals((current) => [
      ...current,
      {
        id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: `Semester ${semesters.length + current.length + 1}`,
        credits: 15,
        gpa: 3,
      },
    ])
  }

  const updateHypothetical = (
    id: string,
    key: 'name' | 'credits' | 'gpa',
    value: string,
  ) => {
    setHypotheticals((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        if (key === 'name') return { ...item, name: value }
        const numeric = parseFloat(value)
        if (Number.isNaN(numeric)) return item
        if (key === 'credits') {
          return { ...item, credits: Math.max(numeric, 0) }
        }
        return { ...item, gpa: Math.min(Math.max(numeric, 0), maxPoint) }
      }),
    )
  }

  const removeHypothetical = (id: string) => {
    setHypotheticals((current) => current.filter((item) => item.id !== id))
  }

  return (
    <div className="m3-card w-full p-6">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-primary">
        <Sparkles className="text-xl" /> What-If Simulator
      </h2>
      <p className="mb-4 text-sm text-on-surface-variant">
        Add hypothetical future semesters to see how your GPA would change.
      </p>

      {hypotheticals.length > 0 && (
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-outline-variant">
                <th className="pb-2 pr-3 font-medium text-on-surface-variant">Semester</th>
                <th className="pb-2 pr-3 font-medium text-on-surface-variant">Credits</th>
                <th className="pb-2 pr-3 font-medium text-on-surface-variant">Expected GPA</th>
                <th className="w-10 pb-2 font-medium text-on-surface-variant" />
              </tr>
            </thead>
            <tbody>
              {hypotheticals.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2 pr-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(event) =>
                        updateHypothetical(item.id, 'name', event.target.value)
                      }
                      className="w-full rounded-t border-0 border-b-2 border-outline bg-surface-container px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-0"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.credits}
                      onChange={(event) =>
                        updateHypothetical(item.id, 'credits', event.target.value)
                      }
                      className="w-24 rounded-t border-0 border-b-2 border-outline bg-surface-container px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-0"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      min="0"
                      max={maxPoint}
                      step="0.1"
                      value={item.gpa}
                      onChange={(event) =>
                        updateHypothetical(item.id, 'gpa', event.target.value)
                      }
                      className="w-24 rounded-t border-0 border-b-2 border-outline bg-surface-container px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-0"
                    />
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => removeHypothetical(item.id)}
                      className="rounded-full p-2 text-error transition-colors hover:bg-surface-container-high"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={addHypothetical}
        className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-all hover:bg-primary-hover hover:shadow-md"
      >
        + Add Hypothetical Semester
      </button>

      {projection && (
        <div className="mt-5 rounded-3xl bg-primary-container/60 p-5">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">
                Projected GPA
              </p>
              <p className="text-2xl font-bold text-primary">
                {projection.projectedGpa.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">Change</p>
              <p
                className={[
                  'text-2xl font-bold',
                  projection.gpaDifference >= 0 ? 'text-success' : 'text-error',
                ].join(' ')}
              >
                {projection.gpaDifference >= 0 ? '+' : ''}
                {projection.gpaDifference.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">
                Total Credits
              </p>
              <p className="text-2xl font-bold text-primary">
                {projection.totalCredits}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
