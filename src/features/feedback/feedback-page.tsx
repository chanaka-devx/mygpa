import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { useGpaStore } from '@/features/gpa/gpa-store'

export function FeedbackPage() {
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const addFeedback = useGpaStore((state) => state.addFeedback)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (description.trim() === '') {
      toast.error('Feedback cannot be empty.')
      return
    }
    setSubmitting(true)
    try {
      addFeedback(description)
      toast.success('Feedback submitted successfully!')
      setDescription('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="m3-card p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Feedback</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Share suggestions or report an issue. Your feedback is saved to your Google Sheet.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-on-surface">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              placeholder="Please share your feedback, suggestions, or report any issues..."
              className="mt-1 block w-full rounded-t border-0 border-b-2 border-outline bg-surface-container p-4 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-0"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              Submit Feedback
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
