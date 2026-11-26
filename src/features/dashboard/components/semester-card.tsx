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
    <div className="mb-4 w-full">
      <div className="mb-2 flex items-center space-x-2">
        <h1
          className={`text-3xl font-semibold ${
            semester.weight === 0 ? 'text-gray-400' : ''
          }`}
        >
          {semester.name}
          {semester.weight === 0 && ` (Weight: ${semester.weight})`}
        </h1>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${semester.name}`}
          className="rounded-md border p-1 text-2xl text-gray-600 hover:text-gray-400"
        >
          <SquarePen className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onRequestDelete}
          aria-label={`Delete ${semester.name}`}
          className="rounded-md border p-1 text-2xl text-red-600 hover:text-red-400"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-2">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="border-b-2 border-gray-300 p-2 sm:w-[60%]">Module Name</th>
              <th className="w-[10%] border-b-2 border-gray-300 p-2">Credit</th>
              <th className="border-b-2 border-gray-300 p-2">Grade</th>
              <th className="w-[10%] border-b-2 border-gray-300 p-2" />
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
