import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Target, XCircle } from 'lucide-react'
import { calculateRequiredGpa, getMaxGradePoint } from '@/features/gpa/calculations'
import type { GradePoint, SemesterWithStats } from '@/features/gpa/types'

interface TargetGpaCalculatorProps {
  semesters: SemesterWithStats[]
  gradeList: GradePoint[]
  currentOverallGpa: number
  currentTotalCredits: number
}

export function TargetGpaCalculator({
  semesters,
  gradeList,
  currentOverallGpa,
  currentTotalCredits,
}: TargetGpaCalculatorProps) {
  const [targetGpa, setTargetGpa] = useState('')
  const [remainingCredits, setRemainingCredits] = useState('')

  const maxPoint = getMaxGradePoint(gradeList)
  const result = calculateRequiredGpa(
    parseFloat(targetGpa),
    parseFloat(remainingCredits),
    currentOverallGpa,
    currentTotalCredits,
    maxPoint,
    semesters.length,
  )

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-primary">
        <Target className="text-xl" /> Target GPA Calculator
      </h2>
      <p className="mb-4 text-sm text-gray-500">
        Find out what GPA you need in your remaining credits to reach your goal.
      </p>

      <div className="mb-5 flex flex-wrap gap-4">
        <div className="min-w-[140px] flex-1 rounded-xl bg-blue-50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Current GPA</p>
          <p className="text-2xl font-bold text-primary">
            {!Number.isNaN(currentOverallGpa) ? currentOverallGpa.toFixed(4) : '0.0000'}
          </p>
        </div>
        <div className="min-w-[140px] flex-1 rounded-xl bg-blue-50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Credits Done</p>
          <p className="text-2xl font-bold text-primary">{currentTotalCredits}</p>
        </div>
        <div className="min-w-[140px] flex-1 rounded-xl bg-blue-50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Max Possible GPA
          </p>
          <p className="text-2xl font-bold text-primary">{maxPoint.toFixed(1)}</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Target GPA
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={maxPoint}
            value={targetGpa}
            onChange={(event) => setTargetGpa(event.target.value)}
            placeholder={`e.g. 3.50 (max ${maxPoint.toFixed(1)})`}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Remaining Credits
          </label>
          <input
            type="number"
            step="1"
            min="1"
            value={remainingCredits}
            onChange={(event) => setRemainingCredits(event.target.value)}
            placeholder="e.g. 45"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {result && (
        <div
          className={[
            'mt-2 rounded-xl border p-4',
            result.status === 'achievable'
              ? 'border-green-200 bg-green-50'
              : result.status === 'difficult'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-red-200 bg-red-50',
          ].join(' ')}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-2xl">
              {result.status === 'achievable' ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : result.status === 'difficult' ? (
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </span>
            <div>
              <p className="font-semibold text-gray-800">
                {result.status === 'impossible'
                  ? 'Not achievable'
                  : result.status === 'difficult'
                    ? 'Challenging but possible'
                    : 'Achievable!'}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {result.status === 'impossible' ? (
                  <>
                    You would need a GPA of{' '}
                    <span className="font-bold text-red-600">
                      {result.requiredGpa}
                    </span>
                    , which exceeds the maximum of{' '}
                    <span className="font-bold">{maxPoint.toFixed(1)}</span>.
                  </>
                ) : (
                  <>
                    You need an average GPA of{' '}
                    <span className="font-bold text-primary">
                      {result.requiredGpa}
                    </span>{' '}
                    in your remaining{' '}
                    <span className="font-bold">{parseFloat(remainingCredits)}</span>{' '}
                    credits to reach{' '}
                    <span className="font-bold">
                      {parseFloat(targetGpa).toFixed(2)}
                    </span>
                    .
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
