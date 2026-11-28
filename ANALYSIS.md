# Analysis and Rebuild Notes

## Current Product

MCM GPA Tracker is a Google-connected GPA tracker. Users sign in with Google;
the app creates a `MyGPA` folder in Drive and a `GPA Data` Sheet inside it, then
syncs semesters, modules, settings, and feedback to that Sheet.

The UI uses a Google Material Design 3 style: tonal surfaces, pill-shaped
buttons, outlined text fields, elevated cards, and a circular progress loader.

## Architecture

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
- `src/features/cloud/cloud-status.tsx` shows Drive sync state.

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

## UI Notes

- Branding is MCM throughout; the old logo was replaced by `public/mcm-logo.svg`.
- The landing page is intentionally minimal: logo, product name, one sentence,
  and Google sign-in.
- The loading animation is a Material 3 circular progress indicator.
- Navigation uses M3 drawer/nav-item patterns with tonal active states.
- Cards use 28px corners, outline variants, and low elevation.

## Preserved Reference Quirk

Preset modules use lowercase `"c"`, so the uppercase grade selector appears
blank while calculations still treat it as C/2.0.

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
