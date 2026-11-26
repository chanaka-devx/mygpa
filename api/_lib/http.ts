import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getConfiguredAppUrl } from './env.js'

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

export function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export function methodNotAllowed(res: VercelResponse): void {
  sendJson(res, 405, { error: 'Method not allowed', code: 'method_not_allowed' })
}

export function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie
  if (!header) return {}

  return header.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separator = part.indexOf('=')
    if (separator === -1) return cookies
    const name = part.slice(0, separator).trim()
    const value = part.slice(separator + 1).trim()
    if (!name) return cookies
    try {
      cookies[name] = decodeURIComponent(value)
    } catch {
      cookies[name] = value
    }
    return cookies
  }, {})
}

interface CookieOptions {
  maxAge?: number
  expires?: Date
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  path?: string
}

export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`]
  parts.push(`Path=${options.path ?? '/'}`)
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`)
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`)
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite[0].toUpperCase()}${options.sameSite.slice(1)}`)
  return parts.join('; ')
}

export function appendCookie(res: VercelResponse, cookie: string): void {
  const existing = res.getHeader('Set-Cookie')
  if (!existing) {
    res.setHeader('Set-Cookie', cookie)
    return
  }
  const values = Array.isArray(existing) ? existing.map(String) : [String(existing)]
  res.setHeader('Set-Cookie', [...values, cookie])
}

export function clearCookie(res: VercelResponse, name: string): void {
  appendCookie(
    res,
    serializeCookie(name, '', {
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      path: '/',
    }),
  )
}

export function getBaseUrl(req: VercelRequest): string {
  const configured = getConfiguredAppUrl()
  if (configured) return configured

  const forwardedHost = req.headers['x-forwarded-host']
  const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || req.headers.host
  const forwardedProto = req.headers['x-forwarded-proto']
  const proto = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto || (host?.includes('localhost') ? 'http' : 'https')
  return `${proto || 'https'}://${host || 'localhost:5173'}`
}

export function cookieOptions(req: VercelRequest, maxAge: number) {
  return {
    httpOnly: true,
    secure: getBaseUrl(req).startsWith('https://'),
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function getJsonBody<T>(req: VercelRequest): T {
  if (typeof req.body === 'string') {
    return JSON.parse(req.body) as T
  }
  return req.body as T
}

export function handleApiError(res: VercelResponse, error: unknown): void {
  if (error instanceof ApiError) {
    sendJson(res, error.status, { error: error.message, code: error.code })
    return
  }

  console.error(error)
  sendJson(res, 500, { error: 'Internal server error', code: 'internal_error' })
}
