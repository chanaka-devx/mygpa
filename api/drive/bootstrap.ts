import type { VercelRequest, VercelResponse } from '@vercel/node'
import { updateSessionDrive } from '../_lib/db'
import { ensureDriveFiles } from '../_lib/google'
import { handleApiError, methodNotAllowed, sendJson } from '../_lib/http'
import { getValidAccessToken, requireSession } from '../_lib/session'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res)
    return
  }

  try {
    const session = await requireSession(req, res)
    if (!session) return

    const accessToken = await getValidAccessToken(session)
    const files = await ensureDriveFiles(session, accessToken)
    await updateSessionDrive(session.id, files.folderId, files.spreadsheetId)

    sendJson(res, 200, files)
  } catch (error) {
    handleApiError(res, error)
  }
}
