import { useEffect, useState } from 'react'
import { Modal } from '@/components/shared/modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DEFAULT_MODULE_LIST } from '@/features/gpa/default-data'
import type { Module } from '@/features/gpa/types'

interface CreateModuleModalProps {
  open: boolean
  onClose: () => void
  onAdd: (module?: Module) => void
}

const sortedModuleNames = DEFAULT_MODULE_LIST.map((module) => module.moduleName).sort()

export function CreateModuleModal({ open, onClose, onAdd }: CreateModuleModalProps) {
  const [moduleName, setModuleName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setModuleName('')
    setError('')
  }, [open])

  const handleAdd = () => {
    if (!moduleName) {
      setError('Module name is required')
      return
    }
    const selected = DEFAULT_MODULE_LIST.find((module) => module.moduleName === moduleName)
    if (selected) {
      onAdd(selected)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Module">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-end justify-between space-x-1">
          <div className="w-full">
            <Label htmlFor="moduleName" className="mb-1">
              {' '}
              Form Default list
            </Label>
            <select
              id="moduleName"
              name="moduleName"
              value={moduleName}
              onChange={(event) => {
                setModuleName(event.target.value)
                setError('')
              }}
              className={[
                'w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
                error ? 'border-red-500' : 'border-gray-300',
              ].join(' ')}
            >
              <option value="">Select  Form Default list</option>
              {sortedModuleNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
          <Button
            onClick={handleAdd}
            className="my-0 rounded-md bg-primary p-3 text-sm text-white hover:bg-secondary"
          >
            Add
          </Button>
        </div>
        <Button
          onClick={() => {
            onAdd()
            onClose()
          }}
        >
          Create Your Own
        </Button>
      </div>
    </Modal>
  )
}
