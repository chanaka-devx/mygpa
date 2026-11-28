import { useEffect, useMemo, useState } from 'react'
import { Loader } from '@/components/shared/loader'
import {
  enrichSemesters,
  getOverallGpa,
  getTotalCredits,
} from '@/features/gpa/calculations'
import { useGpaStore } from '@/features/gpa/gpa-store'
import { CreditsChart } from './components/credits-chart'
import { GpaTrendChart } from './components/gpa-trend-chart'
import { GradeDistributionChart } from './components/grade-distribution-chart'
import { TargetGpaCalculator } from './components/target-gpa-calculator'
import { WhatIfSimulator } from './components/what-if-simulator'

export function AnalyticsPage() {
  const semesters = useGpaStore((state) => state.semesters)
  const gradeList = useGpaStore((state) => state.gradeList)
  const gpaMethod = useGpaStore((state) => state.gpaMethod)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250)
    return () => window.clearTimeout(timer)
  }, [])

  const enriched = useMemo(() => enrichSemesters(semesters, gradeList), [semesters, gradeList])
  const currentGpa = useMemo(
    () => getOverallGpa(enriched, gradeList, gpaMethod),
    [enriched, gradeList, gpaMethod],
  )
  const totalCredits = useMemo(() => getTotalCredits(enriched), [enriched])

  return (
    <div className="mx-auto w-full space-y-6 p-4 sm:p-6">
      {loading && <Loader />}
      <div>
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">
          Analytics & Progress
        </h1>
        <p className="mt-1 text-on-surface-variant">
          Track your academic performance and plan ahead
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GpaTrendChart semesters={enriched} gradeList={gradeList} gpaMethod={gpaMethod} />
        <GradeDistributionChart semesters={enriched} />
      </div>

      <CreditsChart semesters={enriched} />

      <div className="w-full space-y-6">
        <TargetGpaCalculator
          semesters={enriched}
          gradeList={gradeList}
          currentOverallGpa={currentGpa}
          currentTotalCredits={totalCredits}
        />
        <WhatIfSimulator
          semesters={enriched}
          gradeList={gradeList}
          currentOverallGpa={currentGpa}
          currentTotalCredits={totalCredits}
          gpaMethod={gpaMethod}
        />
      </div>
    </div>
  )
}
