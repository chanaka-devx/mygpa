import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth-store'
import { SiteHeader } from './site-header'
import { Sidebar } from './sidebar'

const mobileLinks = [
  { name: 'Home', href: '/dashboard' },
  { name: 'Analytics', href: '/dashboard/analytics' },
  { name: 'Settings', href: '/dashboard/settings' },
  { name: 'Help', href: '/dashboard/help' },
  { name: 'Feedback', href: '/dashboard/feedback' },
]

export function AppLayout() {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <div>
      <div className="md:hidden">
        <SiteHeader links={mobileLinks} />
      </div>
      <div className="flex items-start justify-between">
        <Sidebar />
        <div className="w-full md:ml-64">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
