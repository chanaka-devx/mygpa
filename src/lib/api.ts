export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, message: string, code = 'api_error') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const hasBody = options.body !== undefined
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  })

  const text = await response.text()
  const payload = text ? (JSON.parse(text) as Record<string, unknown>) : {}

  if (!response.ok) {
    throw new ApiError(
      response.status,
      typeof payload.error === 'string' ? payload.error : 'Request failed',
      typeof payload.code === 'string' ? payload.code : 'api_error',
    )
  }

  return payload as T
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body })
}
