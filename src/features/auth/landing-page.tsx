import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Target, Zap } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { GoogleIcon } from '@/components/shared/google-icon'
import { useAuthStore } from './auth-store'

const USER_COUNT = 1015

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader links={[{ name: 'Home', href: '/' }]} />

      <main className="container mx-auto max-w-6xl px-6 py-24">
        <div className="mb-32 text-center">
          <div className="mb-8 inline-block rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
            <p className="text-sm font-medium text-gray-600">
              Trusted by {USER_COUNT}+ students worldwide
            </p>
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl">
            GPA Calc - Free Online
            <br />
            <span className="text-gray-600">GPA Calculator</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl">
            Calculate your grade point average instantly with our free GPA calc tool. Easy
            to use, accurate, and trusted by students worldwide for semester and cumulative
            GPA calculations.
          </p>

          <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-10 shadow-lg">
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">Get Started</h2>
            <p className="mb-8 text-gray-500">Sign in to start tracking your GPA</p>
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
              You will be redirected to Google to authorize Drive access.
            </p>
          </div>
        </div>

        <div className="mb-32 grid gap-8 md:grid-cols-3">
          <div className="group">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
              <Zap className="h-6 w-6 text-gray-700" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Instant Calculation</h3>
            <p className="leading-relaxed text-gray-600">
              Real-time GPA calculations as you enter your grades. See the impact
              immediately.
            </p>
          </div>
          <div className="group">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
              <BarChart3 className="h-6 w-6 text-gray-700" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Progress Tracking</h3>
            <p className="leading-relaxed text-gray-600">
              Monitor your academic performance over time with clear insights and analytics.
            </p>
          </div>
          <div className="group">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
              <Target className="h-6 w-6 text-gray-700" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Goal Planning</h3>
            <p className="leading-relaxed text-gray-600">
              Set academic targets and understand what grades you need to achieve them.
            </p>
          </div>
        </div>

        <div className="border-y border-gray-200 py-16">
          <div className="grid gap-12 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-4xl font-bold text-gray-900">{USER_COUNT}+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-gray-900">∞</div>
              <div className="text-gray-600">Semesters Tracked</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-gray-900">100%</div>
              <div className="text-gray-600">Free Forever</div>
            </div>
          </div>
        </div>

        <div className="mt-24 rounded-2xl bg-gray-50 p-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
              Why Choose Our GPA Calc Tool?
            </h2>
            <div className="mb-12 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  Free Online GPA Calculator
                </h3>
                <p className="leading-relaxed text-gray-600">
                  Our GPA calc tool is completely free to use. Calculate your grade point
                  average instantly without any hidden fees or registration requirements.
                  Perfect for students who need quick and accurate GPA calculations.
                </p>
              </div>
              <div>
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  Accurate GPA Calculation
                </h3>
                <p className="leading-relaxed text-gray-600">
                  Calculate GPA for semester, cumulative, or specific courses with our
                  precise algorithm. Our GPA calculator handles different grading scales and
                  credit hours to give you accurate results every time.
                </p>
              </div>
              <div>
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  Easy to Use Interface
                </h3>
                <p className="leading-relaxed text-gray-600">
                  Simple and intuitive design makes GPA calculation effortless. Just enter
                  your grades and credit hours, and our GPA calc tool does the rest. No
                  complex formulas or confusing interfaces.
                </p>
              </div>
              <div>
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  Save &amp; Track Progress
                </h3>
                <p className="leading-relaxed text-gray-600">
                  Create an account to save your GPA calculations and track your academic
                  progress over time. Monitor trends and set goals to improve your grade
                  point average.
                </p>
              </div>
            </div>

            <div className="text-center">
              <h3 className="mb-6 text-2xl font-semibold text-gray-900">How to Calculate GPA</h3>
              <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-8 text-left shadow-sm">
                <ol className="list-inside list-decimal space-y-3 text-gray-600">
                  <li>Enter your course grades (A, B, C, D, F or numeric)</li>
                  <li>Input the credit hours for each course</li>
                  <li>Our GPA calc tool automatically calculates your grade point average</li>
                  <li>View your semester GPA and cumulative GPA results</li>
                  <li>Save your data to track progress over time</li>
                </ol>
                <p className="mt-6 text-sm text-gray-500">
                  <strong>GPA Calc Formula:</strong> Total grade points ÷ Total credit hours =
                  GPA
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-24 w-full px-6 py-12">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2025 GPA Calc · Powered by{' '}
              <span className="font-medium text-gray-900">Saris Labs</span>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Free online GPA calculator helping students achieve academic excellence
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
