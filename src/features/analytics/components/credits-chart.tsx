import { BarChart3 } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SemesterWithStats } from '@/features/gpa/types'
import { CHART_COLORS, CREDIT_COLORS } from '../chart-theme'

interface CreditsChartProps {
  semesters: SemesterWithStats[]
}

export function CreditsChart({ semesters }: CreditsChartProps) {
  const data = semesters.map((semester) => ({
    name: semester.name,
    Credits: semester.modules
      .filter((module) => module.credit > 0)
      .reduce((sum, module) => sum + module.credit, 0),
  }))

  if (data.length === 0) {
    return (
      <div className="m3-card w-full p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
          <BarChart3 className="text-xl" /> Credits per Semester
        </h2>
        <p className="py-10 text-center text-on-surface-variant">
          Add semesters to see credit breakdown
        </p>
      </div>
    )
  }

  return (
    <div className="m3-card w-full p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
        <BarChart3 className="text-xl" /> Credits per Semester
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: CHART_COLORS.surface,
              borderRadius: '16px',
              border: `1px solid ${CHART_COLORS.grid}`,
              boxShadow: '0 2px 8px rgba(60, 64, 67, 0.12)',
              color: CHART_COLORS.onSurface,
            }}
            formatter={(value) => [`${Number(value) || 0} credits`, 'Credits']}
          />
          <Bar dataKey="Credits" radius={[8, 8, 0, 0]} barSize={48}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={CREDIT_COLORS[index % CREDIT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
