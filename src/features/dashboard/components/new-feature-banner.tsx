import { Sparkles, X } from 'lucide-react'

export function NewFeatureBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="m3-card border-primary-container bg-primary-container/60 p-5 sm:p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start space-x-4">
          <div className="mt-0.5 shrink-0 rounded-2xl bg-surface p-2.5 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-on-primary">
                New Feature
              </span>
              <h3 className="text-sm font-semibold text-on-primary-container sm:text-base">
                Multiple GPA Calculation Methods Now Available!
              </h3>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-on-primary-container sm:text-sm">
              Choose between Weighted SGPA and Weighted Module CGPA anytime from the selector.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center space-x-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onDismiss}
            className="cursor-pointer rounded-full bg-primary px-5 py-2 text-xs font-medium text-on-primary transition-colors hover:bg-primary-hover sm:text-sm"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close notification"
            className="cursor-pointer rounded-full p-2 text-on-primary-container transition-colors hover:bg-surface/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
