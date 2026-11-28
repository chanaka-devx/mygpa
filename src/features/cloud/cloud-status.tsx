import { ExternalLink } from 'lucide-react'
import { useCloudStore, type SyncStatus } from './cloud-store'

const STATUS_LABELS: Record<SyncStatus, string> = {
  idle: 'Not connected',
  syncing: 'Syncing...',
  saving: 'Saving...',
  synced: 'Synced',
  error: 'Sync unavailable',
}

const STATUS_COLORS: Record<SyncStatus, string> = {
  idle: 'bg-outline',
  syncing: 'bg-warning',
  saving: 'bg-warning',
  synced: 'bg-success',
  error: 'bg-error',
}

export function CloudStatus({ compact = false }: { compact?: boolean }) {
  const status = useCloudStore((state) => state.status)
  const spreadsheetUrl = useCloudStore((state) => state.spreadsheetUrl)
  const error = useCloudStore((state) => state.error)

  return (
    <div
      className={
        compact
          ? 'my-3 rounded-2xl bg-surface-container px-4 py-3 text-on-surface-variant'
          : 'mx-3 mb-4 rounded-3xl bg-surface p-4 text-on-surface shadow-sm'
      }
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={
            compact
              ? 'text-xs font-medium'
              : 'text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant'
          }
        >
          Google Drive
        </span>
        <span className="flex items-center gap-2 text-xs font-medium">
          <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
          {STATUS_LABELS[status]}
        </span>
      </div>
      {!compact && error && <p className="mt-2 text-[11px] text-error">{error}</p>}
      {spreadsheetUrl && (
        <a
          href={spreadsheetUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Open Google Sheet
        </a>
      )}
    </div>
  )
}
