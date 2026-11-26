import type { Page } from '@playwright/test'
import { DEFAULT_GRADE_LIST } from '../src/features/gpa/grade-scale'
import { DEFAULT_SEMESTERS } from '../src/features/gpa/default-data'
import type { GpaMethod, Module, Semester } from '../src/features/gpa/types'

export const DEMO_AUTH = {
  state: {
    user: {
      name: 'Demo Student',
      email: 'demo@student.com',
    },
  },
  version: 0,
}

interface SeedOptions {
  auth?: boolean
  semesters?: Semester[]
  gpaMethod?: GpaMethod
  hasSeenNotification?: boolean
}

export async function seedApp(page: Page, options: SeedOptions = {}) {
  const {
    auth = true,
    semesters = [],
    gpaMethod = 'weighted-sgpa',
    hasSeenNotification = true,
  } = options

  const data = {
    state: {
      semesters,
      gradeList: DEFAULT_GRADE_LIST,
      gpaMethod,
      hasSeenGpaMethodNotification: hasSeenNotification,
      feedback: [],
    },
    version: 0,
  }

  await page.addInitScript(
    ({ isAuthenticated, authData, gpaData }) => {
      if (window.localStorage.getItem('__e2e_seeded')) return
      window.localStorage.setItem('__e2e_seeded', '1')
      window.localStorage.setItem('gpa-data', JSON.stringify(gpaData))
      if (isAuthenticated) {
        window.localStorage.setItem('gpa-auth', JSON.stringify(authData))
      } else {
        window.localStorage.removeItem('gpa-auth')
      }
    },
    { isAuthenticated: auth, authData: DEMO_AUTH, gpaData: data },
  )
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
