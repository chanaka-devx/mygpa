import type { Page, Route } from '@playwright/test'
import { DEFAULT_GRADE_LIST } from '../src/features/gpa/grade-scale'
import { DEFAULT_SEMESTERS } from '../src/features/gpa/default-data'
import type {
  CloudData,
  GpaMethod,
  Module,
  Semester,
} from '../src/features/gpa/types'

export const DEMO_USER = {
  name: 'Demo Student',
  email: 'demo@student.com',
  picture: null,
}

const FOLDER_ID = 'folder-1'
const SPREADSHEET_ID = 'sheet-1'
const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`

interface SeedOptions {
  auth?: boolean
  semesters?: Semester[]
  gpaMethod?: GpaMethod
  hasSeenNotification?: boolean
}

function json(route: Route, status: number, body: unknown) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

function readBody(route: Route): { data?: CloudData } {
  const raw = route.request().postData()
  if (!raw) return {}
  try {
    return JSON.parse(raw) as { data?: CloudData }
  } catch {
    return {}
  }
}

export async function seedApp(page: Page, options: SeedOptions = {}) {
  const {
    auth = true,
    semesters = [],
    gpaMethod = 'weighted-sgpa',
    hasSeenNotification = true,
  } = options

  let authenticated = auth
  let cloudData: CloudData = {
    semesters,
    gradeList: DEFAULT_GRADE_LIST.map((grade) => ({ ...grade })),
    gpaMethod,
    hasSeenGpaMethodNotification: hasSeenNotification,
    feedback: [],
  }

  const driveInfo = {
    folderId: FOLDER_ID,
    spreadsheetId: SPREADSHEET_ID,
    spreadsheetUrl: SPREADSHEET_URL,
  }

  await page.route('**/api/auth/session', (route) => {
    if (!authenticated) {
      return json(route, 401, { error: 'Unauthorized', code: 'unauthenticated' })
    }
    return json(route, 200, { user: DEMO_USER, drive: { connected: true } })
  })

  await page.route('**/api/auth/google', (route) => {
    authenticated = true
    return route.fulfill({
      status: 302,
      headers: { location: '/dashboard' },
      body: '',
    })
  })

  await page.route('**/api/auth/logout', (route) => {
    authenticated = false
    return json(route, 200, { ok: true })
  })

  await page.route('**/api/sheets/sync', (route) => {
    if (!authenticated) {
      return json(route, 401, { error: 'Unauthorized', code: 'unauthenticated' })
    }
    if (route.request().method() === 'POST') {
      const body = readBody(route)
      if (body.data) cloudData = body.data
      return json(route, 200, { ok: true, ...driveInfo })
    }
    return json(route, 200, { data: cloudData, ...driveInfo })
  })

  await page.addInitScript((data) => {
    if (window.localStorage.getItem('__e2e_seeded')) return
    window.localStorage.setItem('__e2e_seeded', '1')
    window.localStorage.setItem('gpa-data', JSON.stringify({ state: data, version: 0 }))
  }, cloudData)
}

export function buildSemester(index = 0): Semester {
  const template = DEFAULT_SEMESTERS[index]
  return {
    _id: `sem-${index + 1}`,
    name: template.name,
    weight: template.weight,
    modules: template.modules.map((module) => ({ ...module })),
    sgpa: 0,
    totalCredits: 0,
  }
}

export function buildSemesterWithGrades(
  modules: Module[],
  overrides: Partial<Semester> = {},
): Semester {
  return {
    _id: 'sem-grades',
    name: 'Semester 1',
    weight: 1,
    modules,
    sgpa: 0,
    totalCredits: 0,
    ...overrides,
  }
}

export function waitForCloudSave(page: Page) {
  return page.waitForResponse(
    (response) =>
      response.url().includes('/api/sheets/sync') &&
      response.request().method() === 'POST',
  )
}
