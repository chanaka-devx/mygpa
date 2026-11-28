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
                'w-full rounded-t border-0 border-b-2 bg-surface-container px-4 py-3 text-on-surface focus:outline-none focus:ring-0',
                error ? 'border-error' : 'border-outline',
              ].join(' ')}
            >
              <option value="">Select  Form Default list</option>
              {sortedModuleNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-error">{error}</p>}
          </div>
          <Button
            onClick={handleAdd}
            className="shrink-0"
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
