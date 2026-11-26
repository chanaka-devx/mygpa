export interface GradePoint {
  grade: string
  point: number
}

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

export interface SemesterWithStats extends Semester {
  sgpa: number
  totalCredits: number
}

export type GpaMethod = 'weighted-sgpa' | 'credit-weighted'

export interface User {
  name: string
  email: string
}

export interface FeedbackEntry {
  id: string
  description: string
  createdAt: string
}

export interface DefaultSemester {
  name: string
  modules: Module[]
  sgpa: number
  weight: number
}

export interface HypotheticalSemester {
  id: string
  name: string
  credits: number
  gpa: number
}

export type TargetStatus = 'achievable' | 'difficult' | 'impossible'

export interface TargetResult {
  requiredGpa: number
  status: TargetStatus
}

export interface Projection {
  projectedGpa: number
  gpaDifference: number
  totalCredits: number
}
