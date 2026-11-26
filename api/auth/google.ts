import type { VercelRequest, VercelResponse } from '@vercel/node'
import { CodeChallengeMethod } from 'google-auth-library'
import { randomToken, sha256Base64Url } from '../_lib/crypto.js'
import { createOAuthClient, GOOGLE_SCOPES, getGoogleRedirectUri } from '../_lib/google.js'
import { handleApiError, methodNotAllowed } from '../_lib/http.js'
import { setOAuthCookie } from '../_lib/session.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res)
    return
  }

  try {
    const redirectUri = getGoogleRedirectUri(req)
    const state = randomToken(32)
    const codeVerifier = randomToken(64)
    const codeChallenge = sha256Base64Url(codeVerifier)

    setOAuthCookie(req, res, { state, codeVerifier, redirectUri })

    const client = createOAuthClient(redirectUri)
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_SCOPES,
      prompt: 'consent',
      include_granted_scopes: true,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
    })

    res.statusCode = 302
    res.setHeader('Location', url)
    res.end()
  } catch (error) {
    handleApiError(res, error)
  }
}
