function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function getGoogleClientId(): string {
  return required('GOOGLE_CLIENT_ID')
}

export function getGoogleClientSecret(): string {
  return required('GOOGLE_CLIENT_SECRET')
}

export function getSessionSecret(): string {
  return required('SESSION_SECRET')
}

export function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!value) {
    throw new Error('Missing required environment variable: DATABASE_URL or POSTGRES_URL')
  }
  return value
}

export function getConfiguredAppUrl(): string | null {
  const value = process.env.APP_URL
  return value ? value.replace(/\/+$/, '') : null
}
