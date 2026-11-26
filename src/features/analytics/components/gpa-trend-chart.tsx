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
      <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
          <TrendingUp className="text-xl" /> GPA Trend
        </h2>
        <p className="py-10 text-center text-gray-400">Add semesters to see your GPA trend</p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
        <TrendingUp className="text-xl" /> GPA Trend
        <span className="ml-auto text-xs font-normal text-gray-500">
          {gpaMethod === 'credit-weighted'
            ? 'Cumulative: Weighted Module CGPA'
            : 'Cumulative: Weighted SGPA'}
        </span>
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} />
          <YAxis
            domain={[0, Math.ceil(maxPoint)]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
            formatter={(value) =>
              typeof value === 'number' ? value.toFixed(4) : String(value ?? '')
            }
          />
          <Legend wrapperStyle={{ paddingTop: '12px' }} />
          <Line
            type="monotone"
            dataKey="SGPA"
            stroke="#2cc0fc"
            strokeWidth={2.5}
            dot={{ r: 5, fill: '#2cc0fc', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="Cumulative GPA"
            stroke="#1f5492"
            strokeWidth={2.5}
            dot={{ r: 5, fill: '#1f5492', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
