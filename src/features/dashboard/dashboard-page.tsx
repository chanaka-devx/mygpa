import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Loader } from '@/components/shared/loader'
import { Button } from '@/components/ui/button'
import {
  enrichSemesters,
  getOverallGpa,
  getTotalCredits,
} from '@/features/gpa/calculations'
import { useGpaStore } from '@/features/gpa/gpa-store'
import type { GpaMethod, Module, Semester } from '@/features/gpa/types'
import { DefaultSemesterModal } from './components/default-semester-modal'
import { MethodSelector } from './components/method-selector'
import { NewFeatureBanner } from './components/new-feature-banner'
import { SemesterCard } from './components/semester-card'
import { SemesterFormModal } from './components/semester-form-modal'

type SemesterModalState = {
  open: boolean
  mode: 'add' | 'edit'
  semester: Semester | null
}

export function DashboardPage() {
  const semesters = useGpaStore((state) => state.semesters)
  const gradeList = useGpaStore((state) => state.gradeList)
  const gpaMethod = useGpaStore((state) => state.gpaMethod)
  const hasSeenNotification = useGpaStore((state) => state.hasSeenGpaMethodNotification)
  const addSemester = useGpaStore((state) => state.addSemester)
  const addDefaultSemester = useGpaStore((state) => state.addDefaultSemester)
  const updateSemester = useGpaStore((state) => state.updateSemester)
  const deleteSemester = useGpaStore((state) => state.deleteSemester)
  const addModule = useGpaStore((state) => state.addModule)
  const updateModule = useGpaStore((state) => state.updateModule)
  const deleteModule = useGpaStore((state) => state.deleteModule)
  const setGpaMethod = useGpaStore((state) => state.setGpaMethod)
  const dismissNotification = useGpaStore((state) => state.dismissNotification)

  const [loading, setLoading] = useState(true)
  const [semesterModal, setSemesterModal] = useState<SemesterModalState>({
    open: false,
    mode: 'add',
    semester: null,
  })
  const [defaultModalOpen, setDefaultModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Semester | null>(null)

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

  const handleSemesterSubmit = ({ name, weight }: { name: string; weight: number }) => {
    if (semesterModal.mode === 'add') {
      addSemester({ name, weight })
      toast.success('New semester added successfully')
    } else if (semesterModal.semester) {
      updateSemester({ ...semesterModal.semester, name, weight })
      toast.success('Semester updated successfully')
    }
    setSemesterModal((current) => ({ ...current, open: false }))
  }

  const handleMethodChange = (method: GpaMethod) => {
    setGpaMethod(method)
    toast.success(
      `Switched to ${
        method === 'credit-weighted' ? 'Weighted Module CGPA' : 'Weighted SGPA'
      } calculation`,
    )
  }

  const handleCreateDefault = (index: number) => {
    addDefaultSemester(index)
    toast.success(`Default Semester ${index + 1} added successfully`)
  }

  const handleDeleteSemester = () => {
    if (!deleteTarget) return
    deleteSemester(deleteTarget._id)
    toast.success('Semester deleted successfully')
    setDeleteTarget(null)
  }

  return (
    <div className="w-full p-4">
      {loading && <Loader />}

      {!hasSeenNotification && (
        <NewFeatureBanner onDismiss={() => dismissNotification()} />
      )}

      <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap items-baseline gap-6 sm:gap-8">
          <div className="flex items-baseline space-x-3 sm:space-x-4">
            <h1 className="text-xl font-normal text-gray-800 sm:text-3xl">Current GPA :</h1>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-4xl">
                {Number.isFinite(currentGpa) ? currentGpa.toFixed(4) : '0.0000'}
              </h2>
              <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-primary">
                {gpaMethod === 'credit-weighted' ? 'Weighted Module CGPA' : 'Weighted SGPA'}
              </span>
            </div>
          </div>
          <div className="flex items-baseline space-x-3 sm:space-x-4">
            <h1 className="text-xl font-normal text-gray-800 sm:text-3xl">Total Credits :</h1>
            <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-4xl">
              {totalCredits !== 0 ? totalCredits : 0}
            </h2>
          </div>
        </div>
        <div className="self-start md:self-auto">
          <MethodSelector
            method={gpaMethod}
            onChange={handleMethodChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="my-2 mb-4 h-1 w-full bg-primary" />

      {enriched.map((semester) => (
        <SemesterCard
          key={semester._id}
          semester={semester}
          onEdit={() =>
            setSemesterModal({ open: true, mode: 'edit', semester })
          }
          onRequestDelete={() => setDeleteTarget(semester)}
          onAddModule={(module: Module) => addModule(semester._id, module)}
          onUpdateModule={(module: Module) => updateModule(semester._id, module)}
          onDeleteModule={(moduleId: string) => deleteModule(semester._id, moduleId)}
        />
      ))}

      {enriched.length !== 0 && <div className="h-1 w-full bg-primary" />}

      <div className="mt-4 flex w-full items-center justify-center space-x-4">
        <Button
          onClick={() =>
            setSemesterModal({ open: true, mode: 'add', semester: null })
          }
        >
          Add New Semester
        </Button>
        <Button onClick={() => setDefaultModalOpen(true)}>Choose Default Semester</Button>
      </div>

      <SemesterFormModal
        open={semesterModal.open}
        mode={semesterModal.mode}
        semester={semesterModal.semester}
        onClose={() =>
          setSemesterModal((current) => ({ ...current, open: false }))
        }
        onSubmit={handleSemesterSubmit}
      />

      <DefaultSemesterModal
        open={defaultModalOpen}
        onClose={() => setDefaultModalOpen(false)}
        onCreate={handleCreateDefault}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSemester}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
