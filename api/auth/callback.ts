import type { VercelRequest, VercelResponse } from '@vercel/node'
import { encrypt, randomToken } from '../_lib/crypto'
import { createSession } from '../_lib/db'
import { getSessionSecret } from '../_lib/env'
import { exchangeGoogleCode, getGoogleUser } from '../_lib/google'
import { ApiError, methodNotAllowed } from '../_lib/http'
import {
  clearOAuthCookie,
  readOAuthCookie,
  setSessionCookie,
} from '../_lib/session'

function queryValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function redirect(res: VercelResponse, location: string): void {
  res.statusCode = 302
  res.setHeader('Location', location)
  res.end()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res)
    return
  }

  try {
    const oauth = readOAuthCookie(req)
    const code = queryValue(req.query.code)
    const state = queryValue(req.query.state)
    const oauthError = queryValue(req.query.error)

    if (oauthError) {
      clearOAuthCookie(res)
      redirect(res, '/?auth_error=access_denied')
      return
    }

    if (!oauth || !code || !state || state !== oauth.state) {
      clearOAuthCookie(res)
      redirect(res, '/?auth_error=invalid_state')
      return
    }

    const tokens = await exchangeGoogleCode(code, oauth.codeVerifier, oauth.redirectUri)
    if (!tokens.refreshToken) {
      throw new ApiError(
        401,
        'Google did not return a refresh token. Please try signing in again.',
        'oauth_failed',
      )
    }

    const user = await getGoogleUser(tokens.accessToken)
    const secret = getSessionSecret()
    const sessionId = randomToken(32)

    await createSession({
      id: sessionId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      refreshTokenEncrypted: encrypt(tokens.refreshToken, secret),
      accessTokenEncrypted: encrypt(tokens.accessToken, secret),
      accessTokenExpiresAt: tokens.expiresAt,
    })

    clearOAuthCookie(res)
    setSessionCookie(req, res, sessionId)
    redirect(res, '/dashboard')
  } catch (error) {
    clearOAuthCookie(res)
    const code = error instanceof ApiError ? error.code : 'oauth_failed'
    redirect(res, `/?auth_error=${encodeURIComponent(code)}`)
  }
}
