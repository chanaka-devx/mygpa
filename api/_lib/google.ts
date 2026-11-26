import { google, type sheets_v4 } from 'googleapis'
import type { VercelRequest } from '@vercel/node'
import { getGoogleClientId, getGoogleClientSecret } from './env'
import { ApiError, getBaseUrl } from './http'
import type {
  CloudData,
  DriveFilesResult,
  FeedbackEntry,
  GoogleTokens,
  GoogleUser,
  GradePoint,
  Module,
  Semester,
  SessionRecord,
} from './types'

export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
]

export const FOLDER_NAME = 'MyGPA'
export const SPREADSHEET_NAME = 'GPA Data'

const FOLDER_MIME = 'application/vnd.google-apps.folder'
const SPREADSHEET_MIME = 'application/vnd.google-apps.spreadsheet'

const SHEET_TABS = ['Semesters', 'Modules', 'GradeScale', 'Settings', 'Feedback'] as const
type SheetTab = (typeof SHEET_TABS)[number]

const TAB_HEADERS: Record<SheetTab, string[]> = {
  Semesters: ['id', 'name', 'weight', 'sgpa', 'totalCredits', 'position'],
  Modules: ['semesterId', 'id', 'moduleName', 'grade', 'credit', 'position'],
  GradeScale: ['grade', 'point', 'position'],
  Settings: ['key', 'value'],
  Feedback: ['id', 'description', 'createdAt'],
}

export function getGoogleRedirectUri(req: VercelRequest): string {
  return `${getBaseUrl(req)}/api/auth/callback`
}

export function createOAuthClient(redirectUri?: string) {
  return new google.auth.OAuth2(
    getGoogleClientId(),
    getGoogleClientSecret(),
    redirectUri,
  )
}

export async function exchangeGoogleCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<GoogleTokens> {
  const client = createOAuthClient(redirectUri)
  const { tokens } = await client.getToken({ code, codeVerifier })
  if (!tokens.access_token) {
    throw new ApiError(401, 'Google did not return an access token', 'oauth_failed')
  }
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? null,
    expiresAt: new Date(tokens.expiry_date ?? Date.now() + 60 * 60 * 1000),
  }
}

export async function getGoogleUser(accessToken: string): Promise<GoogleUser> {
  const client = createOAuthClient()
  client.setCredentials({ access_token: accessToken })
  const oauth2 = google.oauth2({ version: 'v2', auth: client })
  const { data } = await oauth2.userinfo.get()
  if (!data.email) {
    throw new ApiError(401, 'Google account email is unavailable', 'oauth_failed')
  }
  return {
    name: data.name || data.email,
    email: data.email,
    picture: data.picture ?? null,
  }
}

export async function refreshGoogleAccessToken(
  refreshToken: string,
): Promise<GoogleTokens> {
  const client = createOAuthClient()
  client.setCredentials({ refresh_token: refreshToken })
  try {
    const { credentials } = await client.refreshAccessToken()
    if (!credentials.access_token) {
      throw new Error('Google did not return an access token')
    }
    return {
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token ?? refreshToken,
      expiresAt: new Date(credentials.expiry_date ?? Date.now() + 60 * 60 * 1000),
    }
  } catch {
    throw new ApiError(
      401,
      'Google authorization expired. Please sign in again.',
      'reauth_required',
    )
  }
}

function getAuthorizedGoogle(accessToken: string) {
  const auth = createOAuthClient()
  auth.setCredentials({ access_token: accessToken })
  return {
    drive: google.drive({ version: 'v3', auth }),
    sheets: google.sheets({ version: 'v4', auth }),
  }
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 404
  )
}

async function isValidFile(
  drive: ReturnType<typeof getAuthorizedGoogle>['drive'],
  fileId: string | null,
  mimeType: string,
): Promise<string | null> {
  if (!fileId) return null
  try {
    const result = await drive.files.get({
      fileId,
      fields: 'id,trashed,mimeType',
    })
    if (result.data.trashed || result.data.mimeType !== mimeType) return null
    return result.data.id ?? null
  } catch (error) {
    if (isNotFound(error)) return null
    throw error
  }
}

async function findOrCreateFolder(
  drive: ReturnType<typeof getAuthorizedGoogle>['drive'],
): Promise<string> {
  const escaped = FOLDER_NAME.replace(/'/g, "\\'")
  const existing = await drive.files.list({
    q: `name = '${escaped}' and mimeType = '${FOLDER_MIME}' and trashed = false`,
    fields: 'files(id,name)',
    spaces: 'drive',
    pageSize: 10,
  })
  const found = existing.data.files?.[0]?.id
  if (found) return found

  const created = await drive.files.create({
    requestBody: {
      name: FOLDER_NAME,
      mimeType: FOLDER_MIME,
    },
    fields: 'id',
  })
  if (!created.data.id) {
    throw new ApiError(502, 'Could not create the Google Drive folder', 'drive_error')
  }
  return created.data.id
}

async function findOrCreateSpreadsheet(
  drive: ReturnType<typeof getAuthorizedGoogle>['drive'],
  folderId: string,
): Promise<string> {
  const escaped = SPREADSHEET_NAME.replace(/'/g, "\\'")
  const existing = await drive.files.list({
    q: `name = '${escaped}' and mimeType = '${SPREADSHEET_MIME}' and '${folderId}' in parents and trashed = false`,
    fields: 'files(id,name)',
    spaces: 'drive',
    pageSize: 10,
  })
  const found = existing.data.files?.[0]?.id
  if (found) return found

  const created = await drive.files.create({
    requestBody: {
      name: SPREADSHEET_NAME,
      mimeType: SPREADSHEET_MIME,
      parents: [folderId],
    },
    fields: 'id',
  })
  if (!created.data.id) {
    throw new ApiError(502, 'Could not create the Google Sheet', 'drive_error')
  }
  return created.data.id
}

function columnLetter(columnCount: number): string {
  let value = columnCount
  let result = ''
  while (value > 0) {
    const remainder = (value - 1) % 26
    result = String.fromCharCode(65 + remainder) + result
    value = Math.floor((value - 1) / 26)
  }
  return result || 'A'
}

async function ensureSheetStructure(
  sheets: ReturnType<typeof getAuthorizedGoogle>['sheets'],
  spreadsheetId: string,
): Promise<void> {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties',
  })
  const existingSheets = meta.data.sheets ?? []
  const existingTitles = new Set(
    existingSheets
      .map((sheet) => sheet.properties?.title)
      .filter((title): title is string => Boolean(title)),
  )

  const hadTargetTabs = SHEET_TABS.some((title) => existingTitles.has(title))
  const requests: sheets_v4.Schema$Request[] = []
  for (const title of SHEET_TABS) {
    if (!existingTitles.has(title)) {
      requests.push({ addSheet: { properties: { title } } })
    }
  }

  const defaultSheet = existingSheets.find((sheet) => sheet.properties?.title === 'Sheet1')
  if (
    !hadTargetTabs &&
    defaultSheet?.properties?.sheetId !== undefined &&
    defaultSheet.properties.sheetId !== null
  ) {
    requests.push({ deleteSheet: { sheetId: defaultSheet.properties.sheetId } })
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    })
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: SHEET_TABS.map((title) => ({
        range: `${title}!A1:${columnLetter(TAB_HEADERS[title].length)}1`,
        values: [TAB_HEADERS[title]],
      })),
    },
  })
}

export async function ensureDriveFiles(
  session: SessionRecord,
  accessToken: string,
): Promise<DriveFilesResult> {
  const { drive, sheets } = getAuthorizedGoogle(accessToken)

  let folderId = await isValidFile(drive, session.folderId, FOLDER_MIME)
  if (!folderId) folderId = await findOrCreateFolder(drive)

  let spreadsheetId = await isValidFile(drive, session.spreadsheetId, SPREADSHEET_MIME)
  if (!spreadsheetId) spreadsheetId = await findOrCreateSpreadsheet(drive, folderId)

  await ensureSheetStructure(sheets, spreadsheetId)

  return {
    folderId,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  }
}

function asString(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function rowsFor(
  response: { data: sheets_v4.Schema$BatchGetValuesResponse },
  index: number,
): unknown[][] {
  return (response.data.valueRanges?.[index]?.values ?? []) as unknown[][]
}

export async function readCloudData(
  accessToken: string,
  spreadsheetId: string,
): Promise<CloudData> {
  const { sheets } = getAuthorizedGoogle(accessToken)
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: [
      'Semesters!A2:F',
      'Modules!A2:F',
      'GradeScale!A2:C',
      'Settings!A2:B',
      'Feedback!A2:D',
    ],
    valueRenderOption: 'UNFORMATTED_VALUE',
  })

  const semesters: Semester[] = []
  const semesterMap = new Map<string, Semester>()
  const semesterOrder = new Map<string, number>()
  rowsFor(response, 0).forEach((row, index) => {
    const id = asString(row[0])
    if (!id) return
    const semester: Semester = {
      _id: id,
      name: asString(row[1]),
      weight: asNumber(row[2], 1),
      modules: [],
      sgpa: asNumber(row[3]),
      totalCredits: asNumber(row[4]),
    }
    semesterMap.set(id, semester)
    semesterOrder.set(id, asNumber(row[5], index))
    semesters.push(semester)
  })

  rowsFor(response, 1).forEach((row) => {
    const semesterId = asString(row[0])
    const semester = semesterMap.get(semesterId)
    if (!semester) return
    const id = asString(row[1])
    if (!id) return
    const module: Module = {
      id,
      moduleName: asString(row[2]),
      grade: asString(row[3]),
      credit: asNumber(row[4]),
    }
    semester.modules.push(module)
  })

  semesters.sort(
    (a, b) => (semesterOrder.get(a._id) ?? 0) - (semesterOrder.get(b._id) ?? 0),
  )

  const gradeList: GradePoint[] = []
  const gradeOrder = new Map<GradePoint, number>()
  rowsFor(response, 2).forEach((row, index) => {
    const grade = asString(row[0])
    if (!grade) return
    const entry: GradePoint = {
      grade,
      point: asNumber(row[1]),
    }
    gradeOrder.set(entry, asNumber(row[2], index))
    gradeList.push(entry)
  })
  gradeList.sort((a, b) => (gradeOrder.get(a) ?? 0) - (gradeOrder.get(b) ?? 0))

  const settings = new Map<string, string>()
  rowsFor(response, 3).forEach((row) => {
    const key = asString(row[0])
    if (key) settings.set(key, asString(row[1]))
  })

  const feedback: FeedbackEntry[] = []
  rowsFor(response, 4).forEach((row) => {
    const id = asString(row[0])
    if (!id) return
    feedback.push({
      id,
      description: asString(row[1]),
      createdAt: asString(row[2]),
    })
  })

  return {
    semesters,
    gradeList,
    gpaMethod:
      settings.get('gpaMethod') === 'credit-weighted' ? 'credit-weighted' : 'weighted-sgpa',
    hasSeenGpaMethodNotification:
      settings.get('hasSeenGpaMethodNotification') === 'true',
    feedback,
  }
}
export async function writeCloudData(
  accessToken: string,
  spreadsheetId: string,
  data: CloudData,
): Promise<string> {
  const { sheets } = getAuthorizedGoogle(accessToken)
  const updatedAt = new Date().toISOString()

  await sheets.spreadsheets.values.batchClear({
    spreadsheetId,
    requestBody: {
      ranges: SHEET_TABS.map((title) => `${title}!A2:Z`),
    },
  })

  const semesterRows = data.semesters.map((semester, index) => [
    semester._id,
    semester.name,
    semester.weight,
    semester.sgpa ?? 0,
    semester.totalCredits ?? 0,
    index,
  ])
  const moduleRows = data.semesters.flatMap((semester) =>
    semester.modules.map((module, index) => [
      semester._id,
      module.id,
      module.moduleName,
      module.grade,
      module.credit,
      index,
    ]),
  )
  const gradeRows = data.gradeList.map((grade, index) => [
    grade.grade,
    grade.point,
    index,
  ])
  const settingsRows = [
    ['gpaMethod', data.gpaMethod],
    ['hasSeenGpaMethodNotification', String(data.hasSeenGpaMethodNotification)],
    ['updatedAt', updatedAt],
    ['schemaVersion', '1'],
  ]
  const feedbackRows = data.feedback.map((entry) => [
    entry.id,
    entry.description,
    entry.createdAt,
  ])

  const valueRanges: sheets_v4.Schema$ValueRange[] = []
  if (semesterRows.length > 0) {
    valueRanges.push({ range: 'Semesters!A2', values: semesterRows })
  }
  if (moduleRows.length > 0) {
    valueRanges.push({ range: 'Modules!A2', values: moduleRows })
  }
  if (gradeRows.length > 0) {
    valueRanges.push({ range: 'GradeScale!A2', values: gradeRows })
  }
  valueRanges.push({ range: 'Settings!A2', values: settingsRows })
  if (feedbackRows.length > 0) {
    valueRanges.push({ range: 'Feedback!A2', values: feedbackRows })
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: valueRanges,
    },
  })

  return updatedAt
}

