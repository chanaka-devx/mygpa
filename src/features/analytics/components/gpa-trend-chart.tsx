import { TrendingUp } from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getGradePoint,
  getMaxGradePoint,
  isNGPA,
  round4,
} from '@/features/gpa/calculations'
import type { GradePoint, GpaMethod, SemesterWithStats } from '@/features/gpa/types'
import { CHART_COLORS } from '../chart-theme'

interface GpaTrendChartProps {
  semesters: SemesterWithStats[]
  gradeList: GradePoint[]
  gpaMethod: GpaMethod
}

export function GpaTrendChart({ semesters, gradeList, gpaMethod }: GpaTrendChartProps) {
  const maxPoint = getMaxGradePoint(gradeList)

  let weightedSum = 0
  let weightSum = 0
  let weightedPoints = 0
  let weightedCredits = 0

  const data = semesters.map((semester) => {
    const sgpa = semester.sgpa ?? 0
    const weight = semester.weight ?? 1
    if (gpaMethod === 'credit-weighted') {
      if (weight > 0) {
        semester.modules?.forEach((module) => {
          if (isNGPA(module.grade)) return
          const point = getGradePoint(module.grade, gradeList)
          if (point === undefined || module.credit <= 0) return
          weightedCredits += weight * module.credit
          weightedPoints += weight * module.credit * point
        })
      }
      const cumulative = weightedCredits > 0 ? round4(weightedPoints / weightedCredits) : 0
      return { name: semester.name, SGPA: sgpa, 'Cumulative GPA': cumulative }
    }

    if (weight > 0 && semester.modules && semester.modules.length > 0) {
      weightedSum += sgpa * weight
      weightSum += weight
    }
    const cumulative = weightSum > 0 ? round4(weightedSum / weightSum) : 0
    return { name: semester.name, SGPA: sgpa, 'Cumulative GPA': cumulative }
  })

  if (data.length === 0) {
    return (
      <div className="m3-card w-full p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
          <TrendingUp className="text-xl" /> GPA Trend
        </h2>
        <p className="py-10 text-center text-on-surface-variant">
          Add semesters to see your GPA trend
        </p>
      </div>
    )
  }

  return (
    <div className="m3-card w-full p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
        <TrendingUp className="text-xl" /> GPA Trend
        <span className="ml-auto text-xs font-normal text-on-surface-variant">
          {gpaMethod === 'credit-weighted'
            ? 'Cumulative: Weighted Module CGPA'
            : 'Cumulative: Weighted SGPA'}
        </span>
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.ceil(maxPoint)]}
            tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: CHART_COLORS.surface,
              borderRadius: '16px',
              border: `1px solid ${CHART_COLORS.grid}`,
              boxShadow: '0 2px 8px rgba(60, 64, 67, 0.12)',
              color: CHART_COLORS.onSurface,
            }}
            formatter={(value) =>
              typeof value === 'number' ? value.toFixed(4) : String(value ?? '')
            }
          />
          <Legend wrapperStyle={{ paddingTop: '12px' }} />
          <Line
            type="monotone"
            dataKey="SGPA"
            stroke={CHART_COLORS.secondary}
            strokeWidth={2.5}
            dot={{
              r: 5,
              fill: CHART_COLORS.secondary,
              strokeWidth: 2,
              stroke: CHART_COLORS.surface,
            }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="Cumulative GPA"
            stroke={CHART_COLORS.primary}
            strokeWidth={2.5}
            dot={{
              r: 5,
              fill: CHART_COLORS.primary,
              strokeWidth: 2,
              stroke: CHART_COLORS.surface,
            }}
            activeDot={{ r: 7 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
