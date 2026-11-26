import { Sparkles, X } from 'lucide-react'

export function NewFeatureBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="relative mb-6 w-full rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-4 shadow-sm transition-all sm:p-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start space-x-3.5">
          <div className="mt-0.5 shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary sm:mt-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
                New Feature
              </span>
              <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                Multiple GPA Calculation Methods Now Available!
              </h3>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
              You can now choose how your overall GPA is calculated: using{' '}
              <strong>Weighted SGPA</strong> [Σ(SGPA × w) / Σw] or{' '}
              <strong>Weighted Module CGPA</strong> [Σ(w × C × GPV) / Σ(w × C)]. Non-GPA
              (NGPA) modules are excluded from all GPA calculations. Switch methods anytime
              using the selector in the top-right.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center space-x-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onDismiss}
            className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-primary/90 sm:text-sm"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close notification"
            className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
