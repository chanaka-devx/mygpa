import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleApiError, methodNotAllowed, sendJson } from '../_lib/http'
import { getSession } from '../_lib/session'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res)
    return
  }

  try {
    const session = await getSession(req)
    if (!session) {
      sendJson(res, 401, { error: 'Unauthorized', code: 'unauthenticated' })
      return
    }

    sendJson(res, 200, {
      user: {
        name: session.name,
        email: session.email,
        picture: session.picture,
      },
      drive: {
        connected: Boolean(session.spreadsheetId),
      },
    })
  } catch (error) {
    handleApiError(res, error)
  }
}
