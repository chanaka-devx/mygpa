import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createFeedbackId, createModuleId, createSemesterId } from '@/lib/id'
import { calculateSGPA, calculateTotalCredits } from './calculations'
import { DEFAULT_GRADE_LIST } from './grade-scale'
import { DEFAULT_SEMESTERS } from './default-data'
import type {
  FeedbackEntry,
  GpaMethod,
  GradePoint,
  Module,
  Semester,
} from './types'

interface GpaState {
  semesters: Semester[]
  gradeList: GradePoint[]
  gpaMethod: GpaMethod
  hasSeenGpaMethodNotification: boolean
  feedback: FeedbackEntry[]
  addSemester: (input: { name: string; weight: number }) => string
  addDefaultSemester: (index: number) => string
  updateSemester: (semester: Semester) => void
  deleteSemester: (semesterId: string) => void
  addModule: (semesterId: string, module: Module) => void
  updateModule: (semesterId: string, module: Module) => void
  deleteModule: (semesterId: string, moduleId: string) => void
  setGpaMethod: (method: GpaMethod) => void
  dismissNotification: () => void
  saveGradeScale: (gradeList: GradePoint[], semesters: Semester[]) => void
  addFeedback: (description: string) => void
  resetAll: () => void
}

const initialState = () => ({
  semesters: [] as Semester[],
  gradeList: DEFAULT_GRADE_LIST.map((item) => ({ ...item })),
  gpaMethod: 'weighted-sgpa' as GpaMethod,
  hasSeenGpaMethodNotification: false,
  feedback: [] as FeedbackEntry[],
})

const withStats = (semester: Semester, gradeList: GradePoint[]): Semester => ({
  ...semester,
  sgpa: calculateSGPA(semester.modules, gradeList),
  totalCredits: calculateTotalCredits(semester.modules),
})

export const useGpaStore = create<GpaState>()(
  persist(
    (set) => ({
      ...initialState(),

      addSemester: ({ name, weight }) => {
        const semester: Semester = {
          _id: createSemesterId(),
          name,
          weight: weight || 1,
          modules: [],
          sgpa: 0,
          totalCredits: 0,
        }
        set((state) => ({ semesters: [...state.semesters, semester] }))
        return semester._id
      },

      addDefaultSemester: (index) => {
        const template = DEFAULT_SEMESTERS[index]
        if (!template) return ''
        const semester: Semester = {
          _id: createSemesterId(),
          name: template.name,
          weight: template.weight,
          modules: template.modules.map((module) => ({ ...module })),
          sgpa: 0,
          totalCredits: 0,
        }
        set((state) => ({ semesters: [...state.semesters, semester] }))
        return semester._id
      },

      updateSemester: (semester) => {
        set((state) => ({
          semesters: state.semesters.map((item) =>
            item._id === semester._id
              ? withStats(
                  {
                    ...item,
                    name: semester.name,
                    weight: semester.weight,
                  },
                  state.gradeList,
                )
              : item,
          ),
        }))
      },

      deleteSemester: (semesterId) => {
        set((state) => ({
          semesters: state.semesters.filter((semester) => semester._id !== semesterId),
        }))
      },

      addModule: (semesterId, module) => {
        set((state) => ({
          semesters: state.semesters.map((semester) =>
            semester._id === semesterId
              ? withStats(
                  { ...semester, modules: [...semester.modules, module] },
                  state.gradeList,
                )
              : semester,
          ),
        }))
      },

      updateModule: (semesterId, module) => {
        set((state) => ({
          semesters: state.semesters.map((semester) =>
            semester._id === semesterId
              ? withStats(
                  {
                    ...semester,
                    modules: semester.modules.map((item) =>
                      item.id === module.id ? module : item,
                    ),
                  },
                  state.gradeList,
                )
              : semester,
          ),
        }))
      },

      deleteModule: (semesterId, moduleId) => {
        set((state) => ({
          semesters: state.semesters.map((semester) =>
            semester._id === semesterId
              ? withStats(
                  {
                    ...semester,
                    modules: semester.modules.filter((item) => item.id !== moduleId),
                  },
                  state.gradeList,
                )
              : semester,
          ),
        }))
      },

      setGpaMethod: (gpaMethod) => set({ gpaMethod }),

      dismissNotification: () => set({ hasSeenGpaMethodNotification: true }),

      saveGradeScale: (gradeList, semesters) => {
        set({
          gradeList,
          semesters: semesters.map((semester) => withStats(semester, gradeList)),
        })
      },

      addFeedback: (description) => {
        const entry: FeedbackEntry = {
          id: createFeedbackId(),
          description,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ feedback: [entry, ...state.feedback] }))
      },

      resetAll: () => set(initialState()),
    }),
    {
      name: 'gpa-data',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export const createCustomModule = (): Module => ({
  id: createModuleId(),
  moduleName: 'module name',
  grade: 'c',
  credit: 0,
})

export const createModuleFromTemplate = (module: Module): Module => ({
  ...module,
  id: createModuleId(),
})
