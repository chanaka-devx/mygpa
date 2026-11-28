import { useEffect, useState } from 'react'
import { Check, Trash2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FormInput } from '@/components/shared/form-input'
import { GRADE_OPTIONS } from '@/features/gpa/grade-scale'
import { isNGPA } from '@/features/gpa/calculations'
import type { Module } from '@/features/gpa/types'

interface ModuleRowProps {
  module: Module
  onUpdate: (module: Module) => void
  onDelete: (moduleId: string) => void
}

interface ModuleForm {
  moduleName: string
  credit: number | ''
  grade: string
}

export function ModuleRow({ module, onUpdate, onDelete }: ModuleRowProps) {
  const [form, setForm] = useState<ModuleForm>({
    moduleName: module.moduleName,
    credit: module.credit,
    grade: module.grade,
  })
  const [errors, setErrors] = useState<{
    moduleName?: string
    credit?: string
    grade?: string
  }>({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    setForm({
      moduleName: module.moduleName,
      credit: module.credit,
      grade: module.grade,
    })
  }, [module])

  const dirty =
    form.moduleName !== module.moduleName ||
    form.credit !== module.credit ||
    form.grade !== module.grade

  const handleSave = () => {
    const nextErrors: { moduleName?: string; credit?: string; grade?: string } = {}
    if (!form.moduleName) nextErrors.moduleName = 'Module name is required'
    const credit = typeof form.credit === 'number' ? form.credit : parseFloat(form.credit)
    if (Number.isNaN(credit) || credit < 0) {
      nextErrors.credit = 'Credit must be a positive number'
    }
    if (!form.grade) nextErrors.grade = 'Grade is required'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    setErrors({})
    onUpdate({
      ...module,
      moduleName: form.moduleName,
      credit,
      grade: form.grade,
    })
    toast.success('Module updated successfully')
  }

  const handleCancel = () => {
    setForm({
      moduleName: module.moduleName,
      credit: module.credit,
      grade: module.grade,
    })
    setErrors({})
  }

  const handleDelete = () => {
    onDelete(module.id)
    toast.success('Module deleted successfully')
  }

  return (
    <>
      <tr className={`h-10 items-center hover:bg-surface-container/60 ${dirty ? 'bg-surface' : ''}`}>
        <td className="p-2">
          <FormInput
            id={`module-name-${module.id}`}
            name="moduleName"
            label=""
            value={form.moduleName}
            onChange={(event) =>
              setForm((current) => ({ ...current, moduleName: event.target.value }))
            }
            error={errors.moduleName}
          />
        </td>
        <td className="p-2">
          <FormInput
            id={`module-credit-${module.id}`}
            name="credit"
            label=""
            type="number"
            value={form.credit}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                credit: event.target.value === '' ? '' : Number(event.target.value),
              }))
            }
            error={errors.credit}
          />
        </td>
        <td className="p-2">
          <div>
            <label
              htmlFor={`grade-${module.id}`}
              className="mb-1 block font-medium"
            />
            <select
              id={`grade-${module.id}`}
              name="grade"
              value={form.grade}
              onChange={(event) =>
                setForm((current) => ({ ...current, grade: event.target.value }))
              }
              className={[
                'w-full rounded-t border-0 border-b-2 bg-surface-container px-3 py-2.5 text-on-surface focus:outline-none focus:ring-0',
                errors.grade ? 'border-error' : 'border-outline',
                isNGPA(module.grade) ? 'opacity-60' : '',
              ].join(' ')}
            >
              <option value="">Select </option>
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            {errors.grade && <p className="mt-1 text-sm text-error">{errors.grade}</p>}
          </div>
        </td>
        <td className="flex items-center p-2">
          {dirty ? (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleSave}
                aria-label="Save module"
                className="rounded-full bg-success-container p-2.5 text-on-success-container transition-colors hover:bg-secondary-container"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Cancel changes"
                className="rounded-full bg-error-container p-2.5 text-on-error-container transition-colors hover:bg-surface-container-high"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              aria-label="Delete module"
              className="rounded-full bg-error-container p-2.5 text-on-error-container transition-colors hover:bg-surface-container-high"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </td>
      </tr>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </>
  )
}
