import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { updateSessionDrive } from '../_lib/db.js'
import { ensureDriveFiles, readCloudData, writeCloudData } from '../_lib/google.js'
import {
  ApiError,
  getJsonBody,
  handleApiError,
  methodNotAllowed,
  sendJson,
} from '../_lib/http.js'
import { getValidAccessToken, requireSession } from '../_lib/session.js'
import type { CloudData } from '../_lib/types.js'

const moduleSchema = z.object({
  id: z.string().min(1),
  moduleName: z.string(),
  grade: z.string(),
  credit: z.number().finite(),
})

const semesterSchema = z.object({
  _id: z.string().min(1),
  name: z.string(),
  weight: z.number().finite(),
  modules: z.array(moduleSchema),
  sgpa: z.number().finite().optional(),
  totalCredits: z.number().finite().optional(),
})

const cloudDataSchema = z.object({
  semesters: z.array(semesterSchema),
  gradeList: z.array(
    z.object({
      grade: z.string().min(1),
      point: z.number().finite(),
    }),
  ),
  gpaMethod: z.enum(['weighted-sgpa', 'credit-weighted']),
  hasSeenGpaMethodNotification: z.boolean(),
  feedback: z.array(
    z.object({
      id: z.string().min(1),
      description: z.string(),
      createdAt: z.string(),
    }),
  ),
})

const bodySchema = z.object({
  data: cloudDataSchema,
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    methodNotAllowed(res)
    return
  }

  try {
    const session = await requireSession(req, res)
    if (!session) return

    const accessToken = await getValidAccessToken(session)
    const files = await ensureDriveFiles(session, accessToken)
    await updateSessionDrive(session.id, files.folderId, files.spreadsheetId)

    if (req.method === 'GET') {
      const data = await readCloudData(accessToken, files.spreadsheetId)
      sendJson(res, 200, { data, ...files })
      return
    }

    const parsed = bodySchema.safeParse(getJsonBody<unknown>(req))
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid sync payload', 'invalid_payload')
    }

    const updatedAt = await writeCloudData(
      accessToken,
      files.spreadsheetId,
      parsed.data.data as CloudData,
    )
    sendJson(res, 200, { ok: true, updatedAt, ...files })
  } catch (error) {
    handleApiError(res, error)
  }
}
