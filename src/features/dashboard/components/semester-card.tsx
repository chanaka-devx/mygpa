import { useState } from 'react'
import { SquarePen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createCustomModule, createModuleFromTemplate } from '@/features/gpa/gpa-store'
import type { Module, SemesterWithStats } from '@/features/gpa/types'
import { CreateModuleModal } from './create-module-modal'
import { ModuleRow } from './module-row'

interface SemesterCardProps {
  semester: SemesterWithStats
  onEdit: () => void
  onRequestDelete: () => void
  onAddModule: (module: Module) => void
  onUpdateModule: (module: Module) => void
  onDeleteModule: (moduleId: string) => void
}

export function SemesterCard({
  semester,
  onEdit,
  onRequestDelete,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
}: SemesterCardProps) {
  const [moduleModalOpen, setModuleModalOpen] = useState(false)

  return (
    <div className="m3-card w-full p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center space-x-2">
        <h1
          className={`text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl ${
            semester.weight === 0 ? 'opacity-50' : ''
          }`}
        >
          {semester.name}
          {semester.weight === 0 && ` (Weight: ${semester.weight})`}
        </h1>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${semester.name}`}
          className="rounded-full border border-outline-variant p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
        >
          <SquarePen className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onRequestDelete}
          aria-label={`Delete ${semester.name}`}
          className="rounded-full border border-outline-variant p-2 text-error transition-colors hover:bg-surface-container-high"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-2">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="border-b-2 border-outline p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant sm:w-[60%]">
                Module Name
              </th>
              <th className="w-[10%] border-b-2 border-outline p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Credit
              </th>
              <th className="border-b-2 border-outline p-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Grade
              </th>
              <th className="w-[10%] border-b-2 border-outline p-3" />
            </tr>
          </thead>
          <tbody>
            {semester.modules.map((module) => (
              <ModuleRow
                key={module.id}
                module={module}
                onUpdate={onUpdateModule}
                onDelete={onDeleteModule}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between space-x-2 px-2">
        <Button onClick={() => setModuleModalOpen(true)}>Add New Module</Button>
        <div className="mb-3 flex items-baseline space-x-1">
          <h1 className="text-xl text-primary sm:text-2xl">
            Total Credits for {semester.name} :{' '}
          </h1>
          <h1 className="text-xl font-bold text-primary sm:text-2xl">
            {semester.totalCredits ?? 0}
          </h1>
        </div>
        <div className="mr-26 flex items-baseline space-x-1">
          <h1 className="text-xl text-primary sm:text-2xl">SGPA : </h1>
          <h1 className="text-xl font-bold text-primary sm:text-2xl">
            {semester.sgpa ?? 0}
          </h1>
        </div>
      </div>

      <CreateModuleModal
        open={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        onAdd={(module) => {
          onAddModule(module ? createModuleFromTemplate(module) : createCustomModule())
        }}
      />
    </div>
  )
}
