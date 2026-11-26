import { describe, expect, it } from 'vitest'
import {
  calculateCreditWeightedGPA,
  calculateProjection,
  calculateRequiredGpa,
  calculateSGPA,
  calculateTotalCredits,
  calculateWeightedSGPA,
  enrichSemesters,
  getGradePoint,
  getMaxGradePoint,
  getOverallGpa,
  getTotalCredits,
  isNGPA,
  round4,
} from './calculations'
import { DEFAULT_GRADE_LIST } from './grade-scale'
import type { Module, Semester } from './types'

const modules: Module[] = [
  { id: '1', moduleName: 'Math', grade: 'A', credit: 3 },
  { id: '2', moduleName: 'Physics', grade: 'B', credit: 3 },
]

const semester = (
  id: string,
  name: string,
  weight: number,
  semesterModules: Module[],
): Semester => ({
  _id: id,
  name,
  weight,
  modules: semesterModules,
  sgpa: 0,
  totalCredits: 0,
})

describe('calculations', () => {
  it('rounds to four decimal places', () => {
    expect(round4(3.14159265)).toBe(3.1416)
    expect(round4(3)).toBe(3)
  })

  it('detects NGPA grades case-insensitively', () => {
    expect(isNGPA('H-(NGPA)')).toBe(true)
    expect(isNGPA('m-(ngpa)')).toBe(true)
    expect(isNGPA('A')).toBe(false)
    expect(isNGPA('')).toBe(false)
  })

  it('looks up grade points case-insensitively', () => {
    expect(getGradePoint('a', DEFAULT_GRADE_LIST)).toBe(4)
    expect(getGradePoint('c', DEFAULT_GRADE_LIST)).toBe(2)
    expect(getGradePoint('H-(NGPA)', DEFAULT_GRADE_LIST)).toBeUndefined()
    expect(getGradePoint('', DEFAULT_GRADE_LIST)).toBeUndefined()
  })

  it('calculates SGPA and ignores NGPA modules', () => {
    expect(calculateSGPA(modules, DEFAULT_GRADE_LIST)).toBe(3.5)
    expect(
      calculateSGPA(
        [
          ...modules,
          { id: '3', moduleName: 'Non GPA', grade: 'H-(NGPA)', credit: 3 },
        ],
        DEFAULT_GRADE_LIST,
      ),
    ).toBe(3.5)
  })

  it('includes NGPA credits in total credits', () => {
    expect(calculateTotalCredits(modules)).toBe(6)
    expect(
      calculateTotalCredits([
        ...modules,
        { id: '3', moduleName: 'Non GPA', grade: 'H-(NGPA)', credit: 3 },
      ]),
    ).toBe(9)
  })

  it('calculates weighted SGPA using semester weights', () => {
    const semesters = enrichSemesters(
      [
        semester('1', 'Semester 1', 0.05, [
          { id: '1', moduleName: 'Math', grade: 'A', credit: 3 },
        ]),
        semester('2', 'Semester 2', 0.15, [
          { id: '2', moduleName: 'Physics', grade: 'B', credit: 3 },
        ]),
      ],
      DEFAULT_GRADE_LIST,
    )
    expect(calculateWeightedSGPA(semesters)).toBe(3.25)
  })

  it('excludes zero-weight semesters from weighted SGPA', () => {
    const semesters = enrichSemesters(
      [
        semester('1', 'Semester 1', 0, [
          { id: '1', moduleName: 'Math', grade: 'A', credit: 3 },
        ]),
        semester('2', 'Semester 2', 1, [
          { id: '2', moduleName: 'Physics', grade: 'B', credit: 3 },
        ]),
      ],
      DEFAULT_GRADE_LIST,
    )
    expect(calculateWeightedSGPA(semesters)).toBe(3)
  })

  it('calculates credit-weighted GPA', () => {
    const semesters = [
      semester('1', 'Semester 1', 1, [
        { id: '1', moduleName: 'Math', grade: 'A', credit: 3 },
        { id: '2', moduleName: 'Physics', grade: 'B', credit: 3 },
      ]),
    ]
    expect(calculateCreditWeightedGPA(semesters, DEFAULT_GRADE_LIST)).toBe(3.5)
  })

  it('dispatches the overall GPA method', () => {
    const semesters = enrichSemesters(
      [semester('1', 'Semester 1', 1, modules)],
      DEFAULT_GRADE_LIST,
    )
    expect(getOverallGpa(semesters, DEFAULT_GRADE_LIST, 'weighted-sgpa')).toBe(3.5)
    expect(getOverallGpa(semesters, DEFAULT_GRADE_LIST, 'credit-weighted')).toBe(3.5)
  })

  it('sums semester credits and finds the max grade point', () => {
    const semesters = enrichSemesters(
      [
        semester('1', 'Semester 1', 1, modules),
        semester('2', 'Semester 2', 1, [
          { id: '3', moduleName: 'Chemistry', grade: 'C', credit: 2 },
        ]),
      ],
      DEFAULT_GRADE_LIST,
    )
    expect(getTotalCredits(semesters)).toBe(8)
    expect(getMaxGradePoint(DEFAULT_GRADE_LIST)).toBe(4)
  })

  it('calculates the required target GPA', () => {
    expect(calculateRequiredGpa(3.5, 30, 3, 30, 4, 1)).toEqual({
      requiredGpa: 4,
      status: 'difficult',
    })
    expect(calculateRequiredGpa(3.8, 30, 3, 30, 4, 1)).toEqual({
      requiredGpa: 4.6,
      status: 'impossible',
    })
    expect(calculateRequiredGpa(3, 30, 3, 30, 4, 1)).toEqual({
      requiredGpa: 3,
      status: 'achievable',
    })
    expect(calculateRequiredGpa(3, 0, 3, 30, 4, 1)).toBeNull()
  })

  it('projects weighted SGPA with hypothetical semesters', () => {
    const semesters = enrichSemesters(
      [semester('1', 'Semester 1', 1, modules)],
      DEFAULT_GRADE_LIST,
    )
    const projection = calculateProjection(
      semesters,
      DEFAULT_GRADE_LIST,
      3.5,
      6,
      'weighted-sgpa',
      [{ id: 'sim', name: 'Semester 2', credits: 15, gpa: 4 }],
    )
    expect(projection).toEqual({
      projectedGpa: 3.75,
      gpaDifference: 0.25,
      totalCredits: 21,
    })
  })

  it('projects credit-weighted GPA with hypothetical semesters', () => {
    const semesters = enrichSemesters(
      [
        semester('1', 'Semester 1', 0.15, [
          { id: '1', moduleName: 'Math', grade: 'A', credit: 30 },
        ]),
      ],
      DEFAULT_GRADE_LIST,
    )
    const projection = calculateProjection(
      semesters,
      DEFAULT_GRADE_LIST,
      4,
      30,
      'credit-weighted',
      [{ id: 'sim', name: 'Semester 2', credits: 15, gpa: 4 }],
    )
    expect(projection).toEqual({
      projectedGpa: 4,
      gpaDifference: 0,
      totalCredits: 45,
    })
  })

  it('returns null projection without hypothetical semesters', () => {
    expect(
      calculateProjection([], DEFAULT_GRADE_LIST, 0, 0, 'weighted-sgpa', []),
    ).toBeNull()
  })
})
