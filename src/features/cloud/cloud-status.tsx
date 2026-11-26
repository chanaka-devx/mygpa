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
  idle: 'bg-gray-400',
  syncing: 'bg-amber-400',
  saving: 'bg-amber-400',
  synced: 'bg-emerald-400',
  error: 'bg-red-400',
}

export function CloudStatus({ compact = false }: { compact?: boolean }) {
  const status = useCloudStore((state) => state.status)
  const spreadsheetUrl = useCloudStore((state) => state.spreadsheetUrl)
  const error = useCloudStore((state) => state.error)

  return (
    <div className={compact ? 'my-3 text-white/80' : 'mx-3 mb-4 rounded-xl bg-white/[0.07] p-3 text-white'}>
      <div className="flex items-center justify-between gap-2">
        <span className={compact ? 'text-xs font-medium' : 'text-[11px] uppercase tracking-widest text-white/40'}>
          Google Drive
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[status]}`} />
          {STATUS_LABELS[status]}
        </span>
      </div>
      {!compact && error && <p className="mt-2 text-[11px] text-red-300">{error}</p>}
      {spreadsheetUrl && (
        <a
          href={spreadsheetUrl}
          target="_blank"
          rel="noreferrer"
          className={`mt-2 inline-flex items-center gap-1 text-xs text-white/70 hover:text-white ${
            compact ? '' : 'underline-offset-2 hover:underline'
          }`}
        >
          <ExternalLink className="h-3 w-3" />
          Open Google Sheet
        </a>
      )}
    </div>
  )
}
