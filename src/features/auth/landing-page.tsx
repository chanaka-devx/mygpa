import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader, ProgressSpinner } from '@/components/shared/loader'
import { SiteHeader } from '@/components/layout/site-header'
import { GoogleIcon } from '@/components/shared/google-icon'
import { useAuthStore } from './auth-store'

export function LandingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const signIn = useAuthStore((state) => state.signIn)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleSignIn = () => {
    setSigningIn(true)
    signIn()
  }

  if (user) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader links={[{ name: 'Home', href: '/' }]} />

      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
        <div className="m3-card w-full max-w-md p-8 md:p-10">
          <div className="mb-7 flex justify-center">
            <img src="/mcm-logo.svg" alt="MCM logo" width={72} height={72} />
          </div>
          <h1 className="text-center text-3xl font-semibold tracking-tight text-on-surface">
            MCM GPA Tracker
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-on-surface-variant">
            Sign in with Google to sync your GPA data to Drive.
          </p>

          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className="mt-9 flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-primary px-6 py-3.5 font-medium text-on-primary shadow-sm transition-all hover:bg-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingIn ? (
              <>
                <ProgressSpinner className="h-5 w-5 text-on-primary" />
                Signing in...
              </>
            ) : (
              <>
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
