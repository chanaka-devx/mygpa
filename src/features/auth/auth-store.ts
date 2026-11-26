import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { User } from '@/features/gpa/types'

export const DEMO_USER: User = {
  name: 'Demo Student',
  email: 'demo@student.com',
}

interface AuthState {
  user: User | null
  signIn: (user?: User) => void
  signOut: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user = DEMO_USER) => set({ user }),
      signOut: () => set({ user: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'gpa-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
