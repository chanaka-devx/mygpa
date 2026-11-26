import { useEffect, useState } from 'react'
import { z } from 'zod'
import { FormInput } from '@/components/shared/form-input'
import { Modal } from '@/components/shared/modal'
import type { Semester } from '@/features/gpa/types'

const schema = z.object({
  semesterName: z.string().min(1, 'Semester name is required'),
  weight: z
    .number()
    .min(0, 'Weight must be at least 0')
    .max(10, 'Weight cannot exceed 10'),
})

interface SemesterFormModalProps {
  open: boolean
  mode: 'add' | 'edit'
  semester?: Semester | null
  onClose: () => void
  onSubmit: (values: { name: string; weight: number }) => void
}

export function SemesterFormModal({
  open,
  mode,
  semester,
  onClose,
  onSubmit,
}: SemesterFormModalProps) {
  const [semesterName, setSemesterName] = useState('')
  const [weight, setWeight] = useState<number | ''>(0)
  const [errors, setErrors] = useState<{ semesterName?: string; weight?: string }>({})

  useEffect(() => {
    if (!open) return
    setSemesterName(semester?.name || '')
    setWeight(semester?.weight ?? 0)
    setErrors({})
  }, [open, semester])

  const handleSubmit = () => {
    const parsedWeight = typeof weight === 'number' ? weight : parseFloat(weight)
    const result = schema.safeParse({ semesterName, weight: parsedWeight })
    if (!result.success) {
      const nextErrors: { semesterName?: string; weight?: string } = {}
      result.error.issues.forEach((issue) => {
        const key = issue.path[0]
        if (key === 'semesterName' || key === 'weight') {
          nextErrors[key] = issue.message
        }
      })
      setErrors(nextErrors)
      return
    }
    setErrors({})
    onSubmit({ name: result.data.semesterName, weight: result.data.weight })
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === 'add' ? 'Add Semester' : 'Edit Semester'}>
      <div className="p-4">
        <FormInput
          name="semesterName"
          label="Semester Name"
          value={semesterName}
          onChange={(event) => setSemesterName(event.target.value)}
          error={errors.semesterName}
        />
        <FormInput
          name="weight"
          label="Weight"
          type="number"
          value={weight}
          onChange={(event) =>
            setWeight(event.target.value === '' ? '' : Number(event.target.value))
          }
          error={errors.weight}
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-4 w-full rounded bg-primary p-2 text-white hover:bg-primary/80"
        >
          Submit
        </button>
      </div>
    </Modal>
  )
}
