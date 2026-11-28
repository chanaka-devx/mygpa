export function ProgressSpinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`m3-progress ${className}`} viewBox="0 0 48 48" role="status">
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Loader() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-surface/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-primary">
        <ProgressSpinner className="h-12 w-12" />
        <p className="text-sm font-medium text-on-surface-variant">Loading…</p>
      </div>
    </div>
  )
}
