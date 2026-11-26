import type { VercelRequest, VercelResponse } from '@vercel/node'
import { decrypt, encrypt } from './crypto'
import { deleteSession, getSessionById, updateSessionTokens } from './db'
import { getSessionSecret } from './env'
import { ApiError, appendCookie, clearCookie, cookieOptions, parseCookies, sendJson, serializeCookie } from './http'
import { refreshGoogleAccessToken } from './google'
import type { SessionRecord } from './types'

export const SESSION_COOKIE = 'gpa_session'
export const OAUTH_COOKIE = 'gpa_oauth'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

interface OAuthCookiePayload {
  state: string
  codeVerifier: string
  redirectUri: string
}

export async function getSession(req: VercelRequest): Promise<SessionRecord | null> {
  const sessionId = parseCookies(req)[SESSION_COOKIE]
  if (!sessionId) return null
  return getSessionById(sessionId)
}

export async function requireSession(
  req: VercelRequest,
  res: VercelResponse,
): Promise<SessionRecord | null> {
  const session = await getSession(req)
  if (!session) {
    sendJson(res, 401, { error: 'Unauthorized', code: 'unauthenticated' })
    return null
  }
  return session
}

export function setSessionCookie(
  req: VercelRequest,
  res: VercelResponse,
  sessionId: string,
): void {
  appendCookie(
    res,
    serializeCookie(SESSION_COOKIE, sessionId, cookieOptions(req, SESSION_MAX_AGE)),
  )
}

export function clearSessionCookie(res: VercelResponse): void {
  clearCookie(res, SESSION_COOKIE)
}

export function setOAuthCookie(
  req: VercelRequest,
  res: VercelResponse,
  payload: OAuthCookiePayload,
): void {
  appendCookie(
    res,
    serializeCookie(
      OAUTH_COOKIE,
      encrypt(JSON.stringify(payload), getSessionSecret()),
      cookieOptions(req, 60 * 10),
    ),
  )
}

export function readOAuthCookie(req: VercelRequest): OAuthCookiePayload | null {
  const value = parseCookies(req)[OAUTH_COOKIE]
  if (!value) return null
  try {
    const parsed = JSON.parse(decrypt(value, getSessionSecret())) as OAuthCookiePayload
    if (!parsed.state || !parsed.codeVerifier || !parsed.redirectUri) return null
    return parsed
  } catch {
    return null
  }
}

export function clearOAuthCookie(res: VercelResponse): void {
  clearCookie(res, OAUTH_COOKIE)
}

export async function signOutSession(req: VercelRequest): Promise<void> {
  const sessionId = parseCookies(req)[SESSION_COOKIE]
  if (sessionId) {
    await deleteSession(sessionId)
  }
}

export async function getValidAccessToken(session: SessionRecord): Promise<string> {
  const secret = getSessionSecret()
  const now = Date.now()
  if (
    session.accessTokenEncrypted &&
    session.accessTokenExpiresAt &&
    session.accessTokenExpiresAt.getTime() > now + 60_000
  ) {
    return decrypt(session.accessTokenEncrypted, secret)
  }

  if (!session.refreshTokenEncrypted) {
    throw new ApiError(
      401,
      'Google authorization expired. Please sign in again.',
      'reauth_required',
    )
  }

  const refreshToken = decrypt(session.refreshTokenEncrypted, secret)
  const refreshed = await refreshGoogleAccessToken(refreshToken)
  await updateSessionTokens(session.id, {
    accessTokenEncrypted: encrypt(refreshed.accessToken, secret),
    accessTokenExpiresAt: refreshed.expiresAt,
    refreshTokenEncrypted: refreshed.refreshToken
      ? encrypt(refreshed.refreshToken, secret)
      : undefined,
  })
  return refreshed.accessToken
}
