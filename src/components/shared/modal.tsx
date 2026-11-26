import type { ReactNode } from 'react'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  showCloseButton?: boolean
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  showCloseButton = true,
  className,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={className}>
        {showCloseButton && <DialogCloseButton />}
        {title && (
          <DialogTitle className="mb-2 text-center text-xl font-semibold">
            {title}
          </DialogTitle>
        )}
        <DialogDescription className={description ? 'mb-4' : 'sr-only'}>
          {description || title || 'Dialog'}
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  )
}
