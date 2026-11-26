import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Menu, User, X } from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth-store'
import { CloudStatus } from '@/features/cloud/cloud-status'

export interface HeaderLink {
  name: string
  href: string
}

interface SiteHeaderProps {
  links: HeaderLink[]
}

export function SiteHeader({ links }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white backdrop-blur-sm">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" width={40} height={40} />
          <div className="text-lg font-semibold text-gray-900">GPA Calculator</div>
        </div>

        <div className="hidden items-center space-x-3 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
            <User size={16} className="text-white" />
          </div>
          {user && <h1 className="text-sm font-medium text-gray-900">{user.name}</h1>}
        </div>

        <button
          type="button"
          className="text-gray-900 focus:outline-none md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-gray-200 bg-gray-100 px-6 pb-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-gray-700 transition hover:text-gray-900"
            >
              {link.name}
            </Link>
          ))}
          {user && <CloudStatus compact />}
          {user && (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="my-4 flex w-full cursor-pointer items-center space-x-3 rounded-lg text-red-500"
            >
              <LogOut className="text-xl" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          )}
        </nav>
      )}
    </header>
  )
}
