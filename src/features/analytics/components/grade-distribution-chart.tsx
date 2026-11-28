import { PieChart as PieChartIcon } from 'lucide-react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { isNGPA } from '@/features/gpa/calculations'
import type { SemesterWithStats } from '@/features/gpa/types'
import { CHART_COLORS, GRADE_COLORS } from '../chart-theme'

const GRADE_ORDER = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']

interface GradeDistributionChartProps {
  semesters: SemesterWithStats[]
}

export function GradeDistributionChart({ semesters }: GradeDistributionChartProps) {
  const counts: Record<string, number> = {}
  semesters.forEach((semester) => {
    semester.modules.forEach((module) => {
      if (isNGPA(module.grade)) return
      if (module.credit <= 0) return
      counts[module.grade] = (counts[module.grade] || 0) + 1
    })
  })

  const data = GRADE_ORDER.filter((grade) => (counts[grade] || 0) > 0).map((grade) => ({
    name: grade,
    value: counts[grade],
    color: GRADE_COLORS[grade] || CHART_COLORS.muted,
  }))
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (data.length === 0) {
    return (
      <div className="m3-card w-full p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
          <PieChartIcon className="text-xl" /> Grade Distribution
        </h2>
        <p className="py-10 text-center text-on-surface-variant">
          Add modules with grades to see your distribution
        </p>
      </div>
    )
  }

  return (
    <div className="m3-card w-full p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
        <PieChartIcon className="text-xl" /> Grade Distribution
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            label={(props) => {
              const { name, value } = props as { name?: string; value?: number }
              return `${name ?? ''} (${(((value ?? 0) / total) * 100).toFixed(0)}%)`
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: CHART_COLORS.surface,
              borderRadius: '16px',
              border: `1px solid ${CHART_COLORS.grid}`,
              boxShadow: '0 2px 8px rgba(60, 64, 67, 0.12)',
              color: CHART_COLORS.onSurface,
            }}
            formatter={(value, name) => [
              `${Number(value) || 0} module${Number(value) !== 1 ? 's' : ''} (${(((Number(value) || 0) / total) * 100).toFixed(1)}%)`,
              String(name ?? ''),
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: '12px' }}
            formatter={(value) => (
              <span className="text-sm text-on-surface-variant">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
