export type GpaMethod = 'weighted-sgpa' | 'credit-weighted'

export interface Module {
  id: string
  moduleName: string
  grade: string
  credit: number
}

export interface Semester {
  _id: string
  name: string
  weight: number
  modules: Module[]
  sgpa?: number
  totalCredits?: number
}

export interface GradePoint {
  grade: string
  point: number
}

export interface FeedbackEntry {
  id: string
  description: string
  createdAt: string
}

export interface CloudData {
  semesters: Semester[]
  gradeList: GradePoint[]
  gpaMethod: GpaMethod
  hasSeenGpaMethodNotification: boolean
  feedback: FeedbackEntry[]
}

export interface GoogleUser {
  name: string
  email: string
  picture: string | null
}

export interface GoogleTokens {
  accessToken: string
  refreshToken: string | null
  expiresAt: Date
}

export interface SessionRecord {
  id: string
  email: string
  name: string
  picture: string | null
  refreshTokenEncrypted: string | null
  accessTokenEncrypted: string | null
  accessTokenExpiresAt: Date | null
  folderId: string | null
  spreadsheetId: string | null
  expiresAt: Date
}

export interface DriveFilesResult {
  folderId: string
  spreadsheetId: string
  spreadsheetUrl: string
}
