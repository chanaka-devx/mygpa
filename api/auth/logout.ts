import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleApiError, methodNotAllowed, sendJson } from '../_lib/http.js'
import {
  clearOAuthCookie,
  clearSessionCookie,
  signOutSession,
} from '../_lib/session.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res)
    return
  }

  try {
    await signOutSession(req)
    clearSessionCookie(res)
    clearOAuthCookie(res)
    sendJson(res, 200, { ok: true })
  } catch (error) {
    clearSessionCookie(res)
    clearOAuthCookie(res)
    handleApiError(res, error)
  }
}
