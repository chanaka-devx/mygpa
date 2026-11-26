import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest()
}

export function encrypt(value: string, secret: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, getKey(secret), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv, tag, encrypted].map((part) => part.toString('base64url')).join('.')
}

export function decrypt(payload: string, secret: string): string {
  const [ivPart, tagPart, encryptedPart] = payload.split('.')
  if (!ivPart || !tagPart || !encryptedPart) {
    throw new Error('Invalid encrypted payload')
  }
  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(secret),
    Buffer.from(ivPart, 'base64url'),
  )
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

export function sha256Base64Url(value: string): string {
  return createHash('sha256').update(value).digest('base64url')
}
