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
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <img src="/mcm-logo.svg" alt="MCM logo" width={40} height={40} />
          <div className="text-lg font-medium tracking-tight text-on-surface">MCM GPA</div>
        </div>

        {user && (
          <>
            <div className="hidden items-center space-x-3 md:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                <User size={18} />
              </div>
              <h1 className="text-sm font-medium text-on-surface">{user.name}</h1>
            </div>

            <button
              type="button"
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container focus:outline-none md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        )}
      </div>

      {user && open && (
        <nav className="border-t border-outline-variant bg-surface px-6 pb-5 md:hidden">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              {link.name}
            </Link>
          ))}
          {user && <CloudStatus compact />}
          {user && (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="my-3 flex w-full cursor-pointer items-center space-x-3 rounded-full px-4 py-3 text-error transition-colors hover:bg-surface-container"
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
