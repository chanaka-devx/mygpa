import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
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
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Feedback</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            placeholder="Please share your feedback, suggestions, or report any issues..."
            className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-60"
          >
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  )
}
