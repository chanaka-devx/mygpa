import type { GradePoint } from './types'

export const DEFAULT_GRADE_LIST: GradePoint[] = [
  { grade: 'A+', point: 4 },
  { grade: 'A', point: 4 },
  { grade: 'A-', point: 3.7 },
  { grade: 'B+', point: 3.3 },
  { grade: 'B', point: 3 },
  { grade: 'B-', point: 2.7 },
  { grade: 'C+', point: 2.3 },
  { grade: 'C', point: 2 },
  { grade: 'C-', point: 1.7 },
  { grade: 'D', point: 1 },
  { grade: 'F', point: 0 },
]

export const NGPA_GRADES = ['H-(NGPA)', 'M-(NGPA)', 'S-(NGPA)', 'E-(NGPA)'] as const

export const GRADE_OPTIONS = [
  'A+',
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
  'D',
  'F',
  ...NGPA_GRADES,
]

export const GRADE_INPUTS = [
  { name: 'Aplus', label: 'A+' },
  { name: 'A', label: 'A' },
  { name: 'Aminus', label: 'A-' },
  { name: 'Bplus', label: 'B+' },
  { name: 'B', label: 'B' },
  { name: 'Bminus', label: 'B-' },
  { name: 'Cplus', label: 'C+' },
  { name: 'C', label: 'C' },
  { name: 'Cminus', label: 'C-' },
  { name: 'D', label: 'D' },
  { name: 'F', label: 'F' },
] as const
