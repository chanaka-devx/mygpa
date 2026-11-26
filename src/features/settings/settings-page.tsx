import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FormInput } from '@/components/shared/form-input'
import { Loader } from '@/components/shared/loader'
import { Button } from '@/components/ui/button'
import { GRADE_INPUTS } from '@/features/gpa/grade-scale'
import { useGpaStore } from '@/features/gpa/gpa-store'
import type { GradePoint, Semester } from '@/features/gpa/types'

type PointValues = Record<string, number | ''>

export function SettingsPage() {
  const semesters = useGpaStore((state) => state.semesters)
  const gradeList = useGpaStore((state) => state.gradeList)
  const saveGradeScale = useGpaStore((state) => state.saveGradeScale)

  const [points, setPoints] = useState<PointValues>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [semesterWeights, setSemesterWeights] = useState<Semester[]>([])
  const [weightInputs, setWeightInputs] = useState<Record<string, number | ''>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const nextPoints: PointValues = {}
    GRADE_INPUTS.forEach(({ label }) => {
      const match = gradeList.find((item) => item.grade === label)
      nextPoints[label] = match?.point ?? 0
    })
    setPoints(nextPoints)

    const nextWeights: Record<string, number | ''> = {}
    semesters.forEach((semester) => {
      nextWeights[semester._id] = semester.weight
    })
    setWeightInputs(nextWeights)
    setSemesterWeights(
      semesters.map((semester) => ({
        ...semester,
        modules: semester.modules.map((module) => ({ ...module })),
      })),
    )
  }, [gradeList, semesters])

  const handlePointChange = (label: string, value: string) => {
    setPoints((current) => ({
      ...current,
      [label]: value === '' ? '' : Number(value),
    }))
    setErrors((current) => ({ ...current, [label]: '' }))
  }

  const handleWeightChange = (semesterId: string, value: string) => {
    const parsed: number | '' = value === '' ? '' : Number(value)
    setWeightInputs((current) => ({ ...current, [semesterId]: parsed }))
    setSemesterWeights((current) =>
      current.map((semester) =>
        semester._id === semesterId
          ? { ...semester, weight: parsed === '' ? 0 : parsed }
          : semester,
      ),
    )
  }

  const handleSave = () => {
    if (saving) return
    const nextErrors: Record<string, string> = {}
    const nextGradeList: GradePoint[] = GRADE_INPUTS.map(({ label }) => {
      const raw = points[label]
      const point = typeof raw === 'number' ? raw : parseFloat(raw)
      if (Number.isNaN(point) || point < 0) {
        nextErrors[label] = 'Point is required'
      }
      return { grade: label, point }
    })

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setSaving(true)
    try {
      saveGradeScale(nextGradeList, semesterWeights)
      toast.success('Grade scale updated successfully')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full p-4">
      {(loading || saving) && <Loader />}

      <h1 className="text-xl font-semibold text-primary">Grades</h1>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {GRADE_INPUTS.map(({ name, label }) => (
          <FormInput
            key={name}
            name={name}
            label={label}
            value={points[label] ?? 0}
            onChange={(event) => handlePointChange(label, event.target.value)}
            error={errors[label]}
            type="number"
          />
        ))}
      </div>

      <h1 className="mt-6 text-xl font-semibold text-primary">Semester Weights</h1>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {semesterWeights.length > 0 ? (
          semesterWeights.map((semester) => (
            <div key={semester._id}>
              <div className="mb-1 text-sm font-medium text-gray-600">
                {semester.name}
              </div>
              <FormInput
                name={`weight-${semester._id}`}
                label=""
                value={weightInputs[semester._id] ?? 0}
                onChange={(event) =>
                  handleWeightChange(semester._id, event.target.value)
                }
                type="number"
              />
            </div>
          ))
        ) : (
          <div className="col-span-4 text-gray-500">No semester data available</div>
        )}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        Save Changes
      </Button>
    </div>
  )
}
