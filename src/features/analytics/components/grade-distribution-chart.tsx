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

const GRADE_COLORS: Record<string, string> = {
  'A+': '#059669',
  A: '#10b981',
  'A-': '#34d399',
  'B+': '#2563eb',
  B: '#3b82f6',
  'B-': '#60a5fa',
  'C+': '#d97706',
  C: '#f59e0b',
  'C-': '#fbbf24',
  D: '#ef4444',
  F: '#991b1b',
}

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
    color: GRADE_COLORS[grade] || '#9ca3af',
  }))
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (data.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
          <PieChartIcon className="text-xl" /> Grade Distribution
        </h2>
        <p className="py-10 text-center text-gray-400">
          Add modules with grades to see your distribution
        </p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
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
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
            formatter={(value, name) => [
              `${Number(value) || 0} module${Number(value) !== 1 ? 's' : ''} (${(((Number(value) || 0) / total) * 100).toFixed(1)}%)`,
              String(name ?? ''),
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: '12px' }}
            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
