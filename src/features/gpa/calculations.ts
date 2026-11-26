import type {
  GradePoint,
  GpaMethod,
  HypotheticalSemester,
  Module,
  Projection,
  Semester,
  SemesterWithStats,
  TargetResult,
} from './types'

export const round4 = (value: number): number => parseFloat(value.toFixed(4))

export const isNGPA = (grade: string | undefined | null): boolean => {
  if (!grade) return false
  const normalized = grade.trim().toUpperCase()
  return (
    normalized.includes('NGPA') ||
    normalized === 'H-(NGPA)' ||
    normalized === 'M-(NGPA)' ||
    normalized === 'S-(NGPA)' ||
    normalized === 'E-(NGPA)'
  )
}

export const getGradePoint = (
  grade: string | undefined,
  gradeList: GradePoint[],
): number | undefined => {
  if (!grade || isNGPA(grade)) return undefined
  const normalized = grade.trim().toLowerCase()
  const match = gradeList.find((item) => item.grade.trim().toLowerCase() === normalized)
  return match?.point
}

export const calculateSGPA = (modules: Module[], gradeList: GradePoint[]): number => {
  if (!modules || modules.length === 0) return 0
  let credits = 0
  let points = 0
  modules.forEach((module) => {
    if (isNGPA(module.grade)) return
    const point = getGradePoint(module.grade, gradeList)
    if (point === undefined || module.credit <= 0) return
    credits += module.credit
    points += point * module.credit
  })
  return credits === 0 ? 0 : round4(points / credits)
}

export const calculateTotalCredits = (modules: Module[]): number => {
  if (!modules || modules.length === 0) return 0
  return modules.filter((module) => module.credit > 0).reduce((sum, module) => sum + module.credit, 0)
}

export const enrichSemesters = (
  semesters: Semester[],
  gradeList: GradePoint[],
): SemesterWithStats[] =>
  semesters.map((semester) => ({
    ...semester,
    sgpa: calculateSGPA(semester.modules, gradeList),
    totalCredits: calculateTotalCredits(semester.modules),
  }))

export const calculateWeightedSGPA = (semesters: SemesterWithStats[]): number => {
  const eligible = semesters.filter(
    (semester) => (semester.weight ?? 1) > 0 && semester.modules && semester.modules.length > 0,
  )
  const selected =
    eligible.length > 0
      ? eligible
      : semesters.filter((semester) => (semester.weight ?? 1) > 0)
  const weightSum = selected.reduce((sum, semester) => sum + (semester.weight ?? 1), 0)
  if (weightSum === 0) return 0
  const weighted = selected.reduce(
    (sum, semester) => sum + (semester.sgpa || 0) * (semester.weight ?? 1),
    0,
  )
  const result = weighted / weightSum
  return Number.isNaN(result) ? 0 : round4(result)
}

export const calculateCreditWeightedGPA = (
  semesters: Semester[],
  gradeList: GradePoint[],
): number => {
  let weightedPoints = 0
  let weightedCredits = 0
  semesters.forEach((semester) => {
    const weight = semester.weight ?? 1
    if (weight <= 0) return
    semester.modules?.forEach((module) => {
      if (isNGPA(module.grade)) return
      const point = getGradePoint(module.grade, gradeList)
      if (point === undefined || module.credit <= 0) return
      weightedPoints += weight * module.credit * point
      weightedCredits += weight * module.credit
    })
  })
  return weightedCredits === 0 ? 0 : round4(weightedPoints / weightedCredits)
}

export const getMaxGradePoint = (gradeList: GradePoint[]): number =>
  gradeList.length === 0 ? 4 : Math.max(...gradeList.map((item) => item.point))

export const getOverallGpa = (
  semesters: SemesterWithStats[],
  gradeList: GradePoint[],
  method: GpaMethod,
): number =>
  method === 'credit-weighted'
    ? calculateCreditWeightedGPA(semesters, gradeList)
    : calculateWeightedSGPA(semesters)

export const getTotalCredits = (semesters: SemesterWithStats[]): number =>
  semesters.reduce((sum, semester) => sum + (semester.totalCredits || 0), 0)

export const calculateRequiredGpa = (
  target: number,
  remaining: number,
  currentGpa: number,
  currentCredits: number,
  maxPoint: number,
  semesterCount: number,
): TargetResult | null => {
  if (
    Number.isNaN(target) ||
    Number.isNaN(remaining) ||
    remaining <= 0 ||
    (currentCredits <= 0 && semesterCount === 0)
  ) {
    return null
  }
  const required = (target * (currentCredits + remaining) - currentGpa * currentCredits) / remaining
  const status =
    required <= 0 || required <= 0.85 * maxPoint
      ? 'achievable'
      : required <= maxPoint
        ? 'difficult'
        : 'impossible'
  return { requiredGpa: round4(required), status }
}

export const calculateProjection = (
  semesters: SemesterWithStats[],
  gradeList: GradePoint[],
  currentGpa: number,
  currentCredits: number,
  method: GpaMethod,
  hypotheticals: HypotheticalSemester[],
): Projection | null => {
  if (hypotheticals.length === 0) return null

  if (method === 'credit-weighted') {
    let weightedPoints = 0
    let weightedCredits = 0
    semesters.forEach((semester) => {
      const weight = semester.weight ?? 1
      if (weight <= 0) return
      semester.modules?.forEach((module) => {
        if (isNGPA(module.grade)) return
        const point = getGradePoint(module.grade, gradeList)
        if (point === undefined || module.credit <= 0) return
        weightedPoints += weight * module.credit * point
        weightedCredits += weight * module.credit
      })
    })
    let totalCredits = currentCredits
    hypotheticals.forEach((item) => {
      weightedPoints += 0.15 * item.credits * item.gpa
      weightedCredits += 0.15 * item.credits
      totalCredits += item.credits
    })
    const projected = weightedCredits > 0 ? round4(weightedPoints / weightedCredits) : 0
    return {
      projectedGpa: projected,
      gpaDifference: round4(projected - currentGpa),
      totalCredits,
    }
  }

  let weightedSum = 0
  let weightSum = 0
  semesters.forEach((semester) => {
    const weight = semester.weight ?? 1
    if (weight > 0 && semester.modules && semester.modules.length > 0) {
      weightedSum += (semester.sgpa || 0) * weight
      weightSum += weight
    }
  })
  let totalCredits = currentCredits
  hypotheticals.forEach((item) => {
    weightedSum += item.gpa
    weightSum += 1
    totalCredits += item.credits
  })
  const projected = weightSum > 0 ? round4(weightedSum / weightSum) : 0
  return {
    projectedGpa: projected,
    gpaDifference: round4(projected - currentGpa),
    totalCredits,
  }
}
