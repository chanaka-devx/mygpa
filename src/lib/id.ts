const randomHex = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('')

export const createSemesterId = (): string => randomHex(24)

export const createModuleId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

export const createFeedbackId = (): string =>
  `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
