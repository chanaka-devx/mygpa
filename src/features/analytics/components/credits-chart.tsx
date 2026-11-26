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

const BAR_COLORS = [
  '#1f5492',
  '#2563eb',
  '#0ba1e7',
  '#2cc0fc',
  '#059669',
  '#10b981',
  '#d97706',
  '#f59e0b',
]

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
      <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
          <BarChart3 className="text-xl" /> Credits per Semester
        </h2>
        <p className="py-10 text-center text-gray-400">
          Add semesters to see credit breakdown
        </p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
        <BarChart3 className="text-xl" /> Credits per Semester
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
            formatter={(value) => [`${Number(value) || 0} credits`, 'Credits']}
          />
          <Bar dataKey="Credits" radius={[8, 8, 0, 0]} barSize={48}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
