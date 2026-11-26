import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { Loader } from '@/components/shared/loader'
import { useAuthStore } from '@/features/auth/auth-store'
import { LandingPage } from '@/features/auth/landing-page'
import { SignInPage } from '@/features/auth/sign-in-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { FeedbackPage } from '@/features/feedback/feedback-page'
import { HelpPage } from '@/features/help/help-page'
import { SettingsPage } from '@/features/settings/settings-page'

const AnalyticsPage = lazy(() =>
  import('@/features/analytics/analytics-page').then((module) => ({
    default: module.AnalyticsPage,
  })),
)

export function App() {
  const initialized = useAuthStore((state) => state.initialized)
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  if (!initialized) {
    return <Loader />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route
            path="analytics"
            element={
              <Suspense fallback={<Loader />}>
                <AnalyticsPage />
              </Suspense>
            }
          />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
