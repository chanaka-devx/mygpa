import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_GRADE_LIST } from './grade-scale'
import { useGpaStore } from './gpa-store'

const reset = () => {
  localStorage.clear()
  useGpaStore.getState().resetAll()
}

describe('gpa store', () => {
  beforeEach(reset)

  it('starts empty with the default grade scale', () => {
    const state = useGpaStore.getState()
    expect(state.semesters).toEqual([])
    expect(state.gradeList).toEqual(DEFAULT_GRADE_LIST)
    expect(state.gpaMethod).toBe('weighted-sgpa')
    expect(state.hasSeenGpaMethodNotification).toBe(false)
  })

  it('adds a semester and falls back to weight 1', () => {
    const id = useGpaStore.getState().addSemester({ name: 'Semester 1', weight: 0 })
    const semester = useGpaStore.getState().semesters[0]
    expect(semester._id).toBe(id)
    expect(semester.name).toBe('Semester 1')
    expect(semester.weight).toBe(1)
  })

  it('adds a preset default semester with modules', () => {
    const id = useGpaStore.getState().addDefaultSemester(0)
    const semester = useGpaStore.getState().semesters[0]
    expect(semester._id).toBe(id)
    expect(semester.name).toBe('Semester 1')
    expect(semester.weight).toBe(0.05)
    expect(semester.modules).toHaveLength(8)
  })

  it('updates a semester name and weight', () => {
    const id = useGpaStore.getState().addSemester({ name: 'Old', weight: 1 })
    const existing = useGpaStore.getState().semesters[0]
    useGpaStore.getState().updateSemester({ ...existing, name: 'New', weight: 0.15 })
    const semester = useGpaStore.getState().semesters.find((item) => item._id === id)
    expect(semester?.name).toBe('New')
    expect(semester?.weight).toBe(0.15)
  })

  it('adds, updates, and deletes modules while recalculating stats', () => {
    const id = useGpaStore.getState().addSemester({ name: 'Semester 1', weight: 1 })
    useGpaStore.getState().addModule(id, {
      id: 'm1',
      moduleName: 'Math',
      grade: 'A',
      credit: 3,
    })
    let semester = useGpaStore.getState().semesters[0]
    expect(semester.sgpa).toBe(4)
    expect(semester.totalCredits).toBe(3)

    useGpaStore.getState().addModule(id, {
      id: 'm2',
      moduleName: 'Non GPA',
      grade: 'H-(NGPA)',
      credit: 2,
    })
    semester = useGpaStore.getState().semesters[0]
    expect(semester.sgpa).toBe(4)
    expect(semester.totalCredits).toBe(5)

    useGpaStore.getState().updateModule(id, {
      id: 'm1',
      moduleName: 'Math',
      grade: 'B',
      credit: 3,
    })
    semester = useGpaStore.getState().semesters[0]
    expect(semester.sgpa).toBe(3)

    useGpaStore.getState().deleteModule(id, 'm2')
    semester = useGpaStore.getState().semesters[0]
    expect(semester.modules).toHaveLength(1)
    expect(semester.totalCredits).toBe(3)
  })

  it('deletes a semester', () => {
    const id = useGpaStore.getState().addSemester({ name: 'Semester 1', weight: 1 })
    useGpaStore.getState().deleteSemester(id)
    expect(useGpaStore.getState().semesters).toEqual([])
  })

  it('saves a grade scale and recalculates existing semesters', () => {
    const id = useGpaStore.getState().addSemester({ name: 'Semester 1', weight: 1 })
    useGpaStore.getState().addModule(id, {
      id: 'm1',
      moduleName: 'Math',
      grade: 'A',
      credit: 3,
    })
    const custom = DEFAULT_GRADE_LIST.map((item) =>
      item.grade === 'A' ? { ...item, point: 3.5 } : { ...item },
    )
    useGpaStore
      .getState()
      .saveGradeScale(custom, useGpaStore.getState().semesters)
    const semester = useGpaStore.getState().semesters[0]
    expect(useGpaStore.getState().gradeList).toEqual(custom)
    expect(semester.sgpa).toBe(3.5)
  })

  it('switches GPA method and dismisses the notification', () => {
    useGpaStore.getState().setGpaMethod('credit-weighted')
    useGpaStore.getState().dismissNotification()
    expect(useGpaStore.getState().gpaMethod).toBe('credit-weighted')
    expect(useGpaStore.getState().hasSeenGpaMethodNotification).toBe(true)
  })

  it('stores feedback newest first', () => {
    useGpaStore.getState().addFeedback('First')
    useGpaStore.getState().addFeedback('Second')
    const feedback = useGpaStore.getState().feedback
    expect(feedback).toHaveLength(2)
    expect(feedback[0].description).toBe('Second')
    expect(feedback[1].description).toBe('First')
  })

  it('resets all state', () => {
    useGpaStore.getState().addSemester({ name: 'Semester 1', weight: 1 })
    useGpaStore.getState().setGpaMethod('credit-weighted')
    useGpaStore.getState().resetAll()
    expect(useGpaStore.getState().semesters).toEqual([])
    expect(useGpaStore.getState().gpaMethod).toBe('weighted-sgpa')
  })
})
