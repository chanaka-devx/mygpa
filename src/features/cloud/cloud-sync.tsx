import { useEffect, useRef, type MutableRefObject } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import { DEFAULT_GRADE_LIST } from '@/features/gpa/grade-scale'
import { useGpaStore } from '@/features/gpa/gpa-store'
import type { CloudData, SyncResponse } from '@/features/gpa/types'
import { useAuthStore } from '@/features/auth/auth-store'
import { useCloudStore } from './cloud-store'

interface SyncWriteResponse {
  ok: boolean
  spreadsheetUrl: string
  folderId: string
}

function snapshotCloudData(): CloudData {
  const state = useGpaStore.getState()
  return {
    semesters: state.semesters,
    gradeList: state.gradeList,
    gpaMethod: state.gpaMethod,
    hasSeenGpaMethodNotification: state.hasSeenGpaMethodNotification,
    feedback: state.feedback,
  }
}

function applyCloudData(data: CloudData): void {
  useGpaStore.setState({
    semesters: data.semesters,
    gradeList:
      data.gradeList.length > 0
        ? data.gradeList
        : DEFAULT_GRADE_LIST.map((grade) => ({ ...grade })),
    gpaMethod: data.gpaMethod,
    hasSeenGpaMethodNotification: data.hasSeenGpaMethodNotification,
    feedback: data.feedback,
  })
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Cloud sync failed'
}

export function CloudSync() {
  const user = useAuthStore((state) => state.user)
  const ready = useCloudStore((state) => state.ready)

  const started = useSyncOnceRef(user)
  const hydrating = useHydratingRef()

  useInitialSync(user, started, hydrating)
  useChangeSync(user, ready, hydrating)

  return null
}

function useSyncOnceRef(user: unknown) {
  const ref = useRef(false)
  useEffect(() => {
    if (!user) ref.current = false
  }, [user])
  return ref
}

function useHydratingRef() {
  return useRef(false)
}

function useInitialSync(
  user: unknown,
  started: MutableRefObject<boolean>,
  hydrating: MutableRefObject<boolean>,
) {
  useEffect(() => {
    if (!user || started.current) return
    started.current = true

    let cancelled = false
    const run = async () => {
      useCloudStore.getState().setStatus('syncing')
      useCloudStore.getState().setError(null)
      try {
        const result = await apiGet<SyncResponse>('/api/sheets/sync')
        if (cancelled) return

        useCloudStore.getState().setDrive({
          spreadsheetUrl: result.spreadsheetUrl,
          folderId: result.folderId,
        })

        const cloudEmpty =
          result.data.semesters.length === 0 &&
          result.data.feedback.length === 0 &&
          result.data.gradeList.length === 0
        const local = snapshotCloudData()
        const localHasData = local.semesters.length > 0 || local.feedback.length > 0

        hydrating.current = true
        if (cloudEmpty && localHasData) {
          const saved = await apiPost<SyncWriteResponse>('/api/sheets/sync', { data: local })
          if (!cancelled) {
            useCloudStore.getState().setDrive({
              spreadsheetUrl: saved.spreadsheetUrl,
              folderId: saved.folderId,
            })
          }
        } else {
          applyCloudData(result.data)
        }
        if (!cancelled) useCloudStore.getState().setStatus('synced')
      } catch (error) {
        if (!cancelled) {
          useCloudStore.getState().setStatus('error')
          useCloudStore.getState().setError(errorMessage(error))
        }
      } finally {
        useCloudStore.getState().setReady(true)
        window.setTimeout(() => {
          hydrating.current = false
        }, 0)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [user, started, hydrating])
}

function useChangeSync(
  user: unknown,
  ready: boolean,
  hydrating: MutableRefObject<boolean>,
) {
  useEffect(() => {
    if (!user || !ready) return

    let timer: number | null = null

    const save = async () => {
      useCloudStore.getState().setStatus('saving')
      try {
        const result = await apiPost<SyncWriteResponse>('/api/sheets/sync', {
          data: snapshotCloudData(),
        })
        useCloudStore.getState().setDrive({
          spreadsheetUrl: result.spreadsheetUrl,
          folderId: result.folderId,
        })
        useCloudStore.getState().setError(null)
        useCloudStore.getState().setStatus('synced')
      } catch (error) {
        useCloudStore.getState().setStatus('error')
        useCloudStore.getState().setError(errorMessage(error))
      }
    }

    const unsubscribe = useGpaStore.subscribe((state, previous) => {
      if (hydrating.current) return
      if (
        state.semesters === previous.semesters &&
        state.gradeList === previous.gradeList &&
        state.gpaMethod === previous.gpaMethod &&
        state.hasSeenGpaMethodNotification === previous.hasSeenGpaMethodNotification &&
        state.feedback === previous.feedback
      ) {
        return
      }
      useCloudStore.getState().setStatus('saving')
      if (timer !== null) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        void save()
      }, 700)
    })

    const flush = () => {
      if (hydrating.current || typeof navigator.sendBeacon !== 'function') return
      const blob = new Blob([JSON.stringify({ data: snapshotCloudData() })], {
        type: 'application/json',
      })
      navigator.sendBeacon('/api/sheets/sync', blob)
    }

    window.addEventListener('pagehide', flush)
    return () => {
      unsubscribe()
      window.removeEventListener('pagehide', flush)
      if (timer !== null) {
        window.clearTimeout(timer)
        flush()
      }
    }
  }, [user, ready, hydrating])
}
