import { Pool } from 'pg'
import { getDatabaseUrl } from './env.js'
import type { SessionRecord } from './types.js'

let pool: Pool | null = null
let schemaPromise: Promise<void> | null = null

function shouldUseSsl(url: string): boolean {
  if (process.env.DATABASE_SSL === 'false') return false
  return (
    process.env.DATABASE_SSL === 'true' ||
    /sslmode=require|neon\.tech|supabase\.co|vercel-storage\.com/i.test(url)
  )
}

function getPool(): Pool {
  if (!pool) {
    const connectionString = getDatabaseUrl()
    pool = new Pool({
      connectionString,
      max: 5,
      ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
    })
  }
  return pool
}

export async function ensureSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = getPool()
      .query(
        `
          CREATE TABLE IF NOT EXISTS gpa_sessions (
            id text PRIMARY KEY,
            email text NOT NULL,
            name text NOT NULL,
            picture text,
            refresh_token text,
            access_token text,
            access_token_expires_at timestamptz,
            folder_id text,
            spreadsheet_id text,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now(),
            expires_at timestamptz NOT NULL DEFAULT now() + interval '30 days'
          );

          CREATE INDEX IF NOT EXISTS gpa_sessions_email_idx ON gpa_sessions (email);
          CREATE INDEX IF NOT EXISTS gpa_sessions_expires_at_idx ON gpa_sessions (expires_at);
        `,
      )
      .then(() => undefined)
      .catch((error) => {
        schemaPromise = null
        throw error
      })
  }
  return schemaPromise
}

export async function createSession(input: {
  id: string
  email: string
  name: string
  picture: string | null
  refreshTokenEncrypted: string | null
  accessTokenEncrypted: string | null
  accessTokenExpiresAt: Date | null
}): Promise<void> {
  await ensureSchema()
  await getPool().query(
    `
      INSERT INTO gpa_sessions (
        id, email, name, picture, refresh_token, access_token, access_token_expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      input.id,
      input.email,
      input.name,
      input.picture,
      input.refreshTokenEncrypted,
      input.accessTokenEncrypted,
      input.accessTokenExpiresAt,
    ],
  )
}

export async function getSessionById(id: string): Promise<SessionRecord | null> {
  await ensureSchema()
  const result = await getPool().query<SessionRecord>(
    `
      SELECT
        id,
        email,
        name,
        picture,
        refresh_token AS "refreshTokenEncrypted",
        access_token AS "accessTokenEncrypted",
        access_token_expires_at AS "accessTokenExpiresAt",
        folder_id AS "folderId",
        spreadsheet_id AS "spreadsheetId",
        expires_at AS "expiresAt"
      FROM gpa_sessions
      WHERE id = $1 AND expires_at > now()
    `,
    [id],
  )
  return result.rows[0] ?? null
}

export async function deleteSession(id: string): Promise<void> {
  await ensureSchema()
  await getPool().query('DELETE FROM gpa_sessions WHERE id = $1', [id])
}

export async function updateSessionTokens(
  id: string,
  input: {
    accessTokenEncrypted: string | null
    accessTokenExpiresAt: Date | null
    refreshTokenEncrypted?: string | null
  },
): Promise<void> {
  await ensureSchema()
  if (input.refreshTokenEncrypted !== undefined) {
    await getPool().query(
      `
        UPDATE gpa_sessions
        SET access_token = $2,
            access_token_expires_at = $3,
            refresh_token = $4,
            updated_at = now()
        WHERE id = $1
      `,
      [id, input.accessTokenEncrypted, input.accessTokenExpiresAt, input.refreshTokenEncrypted],
    )
    return
  }

  await getPool().query(
    `
      UPDATE gpa_sessions
      SET access_token = $2,
          access_token_expires_at = $3,
          updated_at = now()
      WHERE id = $1
    `,
    [id, input.accessTokenEncrypted, input.accessTokenExpiresAt],
  )
}

export async function updateSessionDrive(
  id: string,
  folderId: string,
  spreadsheetId: string,
): Promise<void> {
  await ensureSchema()
  await getPool().query(
    `
      UPDATE gpa_sessions
      SET folder_id = $2,
          spreadsheet_id = $3,
          updated_at = now()
      WHERE id = $1
    `,
    [id, folderId, spreadsheetId],
  )
}

export async function deleteExpiredSessions(): Promise<void> {
  await ensureSchema()
  await getPool().query('DELETE FROM gpa_sessions WHERE expires_at <= now()')
}
