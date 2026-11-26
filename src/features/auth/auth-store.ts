import { create } from 'zustand'
import { apiGet, apiPost, ApiError } from '@/lib/api'
import type { User } from '@/features/gpa/types'

interface SessionResponse {
  user: User
  drive: { connected: boolean }
}

interface AuthState {
  user: User | null
  initialized: boolean
  initializing: boolean
  error: string | null
  initialize: () => Promise<void>
  signIn: () => void
  signOut: () => Promise<void>
}

let initializationPromise: Promise<void> | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initialized: false,
  initializing: false,
  error: null,

  initialize: () => {
    if (get().initialized) return Promise.resolve()
    if (initializationPromise) return initializationPromise

    initializationPromise = (async () => {
      set({ initializing: true, error: null })
      try {
        const response = await apiGet<SessionResponse>('/api/auth/session')
        set({ user: response.user })
      } catch (error) {
        set({
          user: null,
          error:
            error instanceof ApiError && error.status === 401
              ? null
              : 'Could not load your session',
        })
      } finally {
        set({ initialized: true, initializing: false })
        initializationPromise = null
      }
    })()

    return initializationPromise
  },

  signIn: () => {
    window.location.assign('/api/auth/google')
  },

  signOut: async () => {
    try {
      await apiPost('/api/auth/logout')
    } finally {
      set({ user: null })
    }
  },
}))
