import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '@/components/layout/site-header'
import { GoogleIcon } from '@/components/shared/google-icon'
import { useAuthStore } from './auth-store'

export function SignInPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const signIn = useAuthStore((state) => state.signIn)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleSignIn = () => {
    setSigningIn(true)
    window.setTimeout(() => {
      signIn()
      navigate('/dashboard')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader links={[{ name: 'Home', href: '/' }]} />
      <main className="mx-auto flex max-w-6xl items-center justify-center px-6 py-24">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-10 shadow-lg">
          <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mb-8 text-center text-gray-500">
            to continue to GPA Calculator
          </p>
          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-gray-900 px-6 py-4 font-medium text-white transition-colors duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {signingIn ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </>
            ) : (
              <>
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
              </>
            )}
          </button>
          <p className="mt-4 text-center text-xs text-gray-400">
            Demo authentication · No real Google account is used
          </p>
        </div>
      </main>
    </div>
  )
}
