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
    <div className="fixed hidden h-full min-h-screen w-full flex-col justify-between bg-primary text-white md:flex sm:w-64">
      <div className="flex flex-col">
        <div className="px-5 pb-4 pt-6">
          <h1 className="text-xl font-bold tracking-tight text-white">GPA Calculator</h1>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-white/40">
            Academic Tracker
          </p>
        </div>

        <div className="mx-3 mb-4 rounded-xl bg-white/[0.07] p-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/10">
              <User size={16} className="text-white/80" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || 'Student'}
              </p>
              <p className="truncate text-[11px] text-white/50">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        <CloudStatus />

        <div className="mx-5 mb-2">
          <div className="h-px bg-white/10" />
          <p className="mb-1 mt-3 text-[10px] font-medium uppercase tracking-widest text-white/30">
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
                  'group relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200 ease-out',
                  active
                    ? 'bg-white font-semibold text-primary shadow-sm'
                    : 'text-white/70 hover:bg-white/[0.08] hover:text-white',
                ].join(' ')}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <span
                  className={[
                    'flex-shrink-0 text-lg transition-colors',
                    active ? 'text-primary' : 'text-white/60 group-hover:text-white/90',
                  ].join(' ')}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="px-3 pb-6">
        <div className="mx-2 mb-3 h-px bg-white/10" />
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-all duration-200 hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}
