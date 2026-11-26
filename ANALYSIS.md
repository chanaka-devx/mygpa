# Analysis and Rebuild Notes

## Reference

- Original target: `https://gpa.sarislabs.com/dashboard`
- Reference extraction artifacts remain in `_analysis/`.
- The UI was rebuilt for visual fidelity first, then extended from LocalStorage
  into a Google-backed application.

## Current Architecture

One Vercel project serves both parts:

```text
/          Vite React app
/api/*     Vercel serverless functions
```

Using one domain avoids CORS configuration and cross-site cookie problems.

Frontend:

- Zustand holds in-memory GPA/auth state.
- LocalStorage is retained as a cache and migration source.
- `src/features/cloud/cloud-sync.tsx` performs cloud hydration and writes.
- Cloud status is shown in the sidebar and mobile navigation.

Backend:

- `api/auth/*` implements Google OAuth with PKCE and offline access.
- `api/drive/bootstrap.ts` finds or creates the Drive folder and spreadsheet.
- `api/sheets/sync.ts` maps application state to structured sheet tabs.
- Tokens are encrypted with AES-256-GCM using `SESSION_SECRET`.
- Sessions and cloud file IDs are stored in Postgres.

## OAuth Flow

1. `GET /api/auth/google` creates `state` and a PKCE verifier, stores them in an
   encrypted temporary cookie, and redirects to Google.
2. Google redirects to `GET /api/auth/callback`.
3. The callback validates state, exchanges the code for tokens, reads the user
   profile, creates a database session, sets an `httpOnly` cookie, and redirects
   to `/dashboard`.
4. `GET /api/auth/session` hydrates the frontend auth store.
5. Access tokens are refreshed server-side using the stored refresh token.

Scopes requested:

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/spreadsheets`

## Google Drive and Sheets Layout

The backend finds or creates:

```text
MyGPA/
  GPA Data
```

Spreadsheet tabs and columns:

- `Semesters`: id, name, weight, sgpa, totalCredits, position
- `Modules`: semesterId, id, moduleName, grade, credit, position
- `GradeScale`: grade, point, position
- `Settings`: key, value
- `Feedback`: id, description, createdAt

`Settings` stores `gpaMethod`, `hasSeenGpaMethodNotification`, `updatedAt`, and
`schemaVersion`.

## Sync Strategy

- On initial load, the client fetches `/api/sheets/sync`.
- If the cloud is empty and LocalStorage has data, local data is migrated up.
- Otherwise cloud data replaces the local store.
- Subsequent state changes are debounced and posted to the same endpoint.
- A `pagehide` listener sends a final `sendBeacon` request.
- The route is protected by the session cookie; tokens never reach the browser.

## Visual Fidelity Details Preserved

- Primary `#2b2b41`, secondary `#193636`, Geist font, sidebar/header layout.
- Dashboard GPA/credit headings and method badge.
- New-feature banner and semester/module CRUD.
- Analytics title “Analytics & Progress”, charts, target calculator, and what-if
  simulator.
- Settings, help, feedback, and responsive navigation.

## Preserved Reference Quirk

Preset modules use lowercase `"c"`, so the uppercase grade selector appears
blank while calculations still treat it as C/2.0.

## Deliberate Deviations

- Mock auth was replaced with real Google OAuth.
- LocalStorage is no longer the source of truth, only a cache/migration source.
- Google Drive/Sheets is the user-facing data store.
- A small Postgres-compatible database stores encrypted session/token records.
- Adding a module still persists immediately.
- Preset module IDs are regenerated when added.

## Verification

- `npm run typecheck`: passes for app, config, and API.
- `npm run build`: passes.
- `npm run lint`: passes.
- `npm test`: 24 unit tests pass.
- `npm run test:e2e`: 10 Playwright tests pass with mocked API routes.

## Remaining Risks

- Real Google OAuth and Drive/Sheets calls require configured credentials and a
  database; they are not exercised by the automated test suite.
- Google Sheets does not provide transactional multi-device writes.
- OAuth verification may be required for external users.
- Google API quotas and Sheet size limits apply.
- `npm audit` currently reports vulnerabilities in the dependency tree.
