import { create } from 'zustand'

export type SyncStatus = 'idle' | 'syncing' | 'saving' | 'synced' | 'error'

interface CloudState {
  status: SyncStatus
  ready: boolean
  spreadsheetUrl: string | null
  folderId: string | null
  error: string | null
  setStatus: (status: SyncStatus) => void
  setReady: (ready: boolean) => void
  setDrive: (input: { spreadsheetUrl: string; folderId: string }) => void
  setError: (error: string | null) => void
}

export const useCloudStore = create<CloudState>((set) => ({
  status: 'idle',
  ready: false,
  spreadsheetUrl: null,
  folderId: null,
  error: null,
  setStatus: (status) => set({ status }),
  setReady: (ready) => set({ ready }),
  setDrive: ({ spreadsheetUrl, folderId }) => set({ spreadsheetUrl, folderId }),
  setError: (error) => set({ error }),
}))
