import { useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  User,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth-store'
import { CloudStatus } from '@/features/cloud/cloud-status'

const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
  { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="fixed hidden h-full min-h-screen w-full flex-col justify-between border-r border-outline-variant bg-surface-container text-on-surface md:flex sm:w-72">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 px-5 pb-5 pt-7">
          <img src="/mcm-logo.svg" alt="MCM logo" width={36} height={36} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-on-surface">MCM GPA</h1>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-on-surface-variant">
              Academic Tracker
            </p>
          </div>
        </div>

        <div className="mx-3 mb-4 rounded-3xl bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <User size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-on-surface">
                {user?.name || 'Student'}
              </p>
              <p className="truncate text-[11px] text-on-surface-variant">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>

        <CloudStatus />

        <div className="mx-5 mb-2">
          <div className="h-px bg-outline-variant" />
          <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
            Menu
          </p>
        </div>

        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const active = location.pathname === item.href
            const Icon = item.icon
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => navigate(item.href)}
                className={[
                  'flex w-full cursor-pointer items-center gap-4 rounded-full px-4 py-3 text-left text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                ].join(' ')}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="px-3 pb-6">
        <div className="mx-2 mb-3 h-px bg-outline-variant" />
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="flex w-full cursor-pointer items-center gap-4 rounded-full px-4 py-3 text-sm font-medium text-error transition-colors hover:bg-surface-container-high"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}
