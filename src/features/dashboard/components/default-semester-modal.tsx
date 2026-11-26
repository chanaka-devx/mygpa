import { Modal } from '@/components/shared/modal'
import { Button } from '@/components/ui/button'

interface DefaultSemesterModalProps {
  open: boolean
  onClose: () => void
  onCreate: (index: number) => void
}

export function DefaultSemesterModal({
  open,
  onClose,
  onCreate,
}: DefaultSemesterModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Create Default Semester">
      <div className="flex flex-col gap-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Button
            key={index}
            onClick={() => {
              onCreate(index)
              onClose()
            }}
          >
            Default Semester {index + 1}
          </Button>
        ))}
      </div>
    </Modal>
  )
}
