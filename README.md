# MCM GPA Tracker

A Google-connected GPA tracker. Users sign in with Google, the app creates a
`MyGPA` folder in their Google Drive and a `GPA Data` Google Sheet inside it,
then syncs all semester/module/settings/feedback data to that sheet.

The frontend and backend are deployed as one Vercel project on one domain, so
there are no CORS or cross-site cookie issues.

## Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS 4 with local shadcn/ui-style primitives
- React Router 7
- Zustand 5 with LocalStorage as a local cache
- Recharts for analytics
- Vercel serverless functions for the backend
- Google Drive API + Google Sheets API
- Postgres-compatible database for encrypted tokens and sessions
- Vitest and Playwright for tests

## Google Cloud Setup

1. Create a Google Cloud project.
2. Enable **Google Drive API** and **Google Sheets API**.
3. Configure the OAuth consent screen.
4. Create an OAuth client of type **Web application**.
5. Add the production redirect URI:

   ```text
   https://your-domain.vercel.app/api/auth/callback
   ```

   For local development with `vercel dev`, add:

   ```text
   http://localhost:3000/api/auth/callback
   ```

6. Add test users while the app is in testing mode, or publish the app if you
   need external users. The requested scopes include Drive/Sheets access, so
   Google may require verification.

## Environment Variables

Copy `.env.example` to `.env.local` for local development and set these in the
Vercel project for production:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=
DATABASE_URL=
APP_URL=
DATABASE_SSL=
```

`SESSION_SECRET` should be a long random string. `APP_URL` must be the public
origin of the deployed app, without a trailing slash.

## Local Development

```bash
npm install
cp .env.example .env.local
npx vercel dev
```

Open `http://localhost:3000`. `npm run dev` starts only the Vite frontend and
will not provide `/api` endpoints.

## Deploying to Vercel

1. Import this repository into Vercel.
2. Add the environment variables above.
3. Deploy. The Vite app is served from `/` and serverless functions from
   `/api/*`.
4. Set `APP_URL` to the final Vercel domain and add the callback URI to the
   Google OAuth client.

## Backend Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/auth/google` | GET | Start Google OAuth with PKCE and offline access |
| `/api/auth/callback` | GET | Exchange code, create session, redirect to dashboard |
| `/api/auth/session` | GET | Return the current user |
| `/api/auth/logout` | POST | Delete the session and clear cookies |
| `/api/drive/bootstrap` | POST | Find or create the Drive folder and Sheet |
| `/api/sheets/sync` | GET | Read all app data from the Sheet |
| `/api/sheets/sync` | POST | Write all app data to the Sheet |

## Data Storage

### Database

The serverless backend creates this table on first use:

```text
gpa_sessions
  id, email, name, picture,
  refresh_token, access_token, access_token_expires_at,
  folder_id, spreadsheet_id,
  created_at, updated_at, expires_at
```

Refresh and access tokens are encrypted at rest using `SESSION_SECRET`. The
browser receives only an `httpOnly`, `Secure`, `SameSite=Lax` session cookie.

### Google Drive and Sheets

On first sync the backend finds or creates:

```text
MyGPA/
  GPA Data
```

The spreadsheet has these tabs:

| Tab | Columns |
| --- | --- |
| `Semesters` | id, name, weight, sgpa, totalCredits, position |
| `Modules` | semesterId, id, moduleName, grade, credit, position |
| `GradeScale` | grade, point, position |
| `Settings` | key, value |
| `Feedback` | id, description, createdAt |

### Sync Behavior

- LocalStorage remains a cache so the UI works immediately on reload.
- On login, the app reads the Sheet and replaces local state with cloud state.
- If the Sheet is empty but LocalStorage contains data, that data is migrated
  into the Sheet.
- Changes are debounced and written back to the Sheet.
- `pagehide` uses `sendBeacon` as a best-effort final flush.

## GPA Logic

- SGPA = `Σ(point × credit) / Σcredit`, skipping NGPA modules.
- Total credits include NGPA credits.
- Weighted SGPA = `Σ(SGPA × weight) / Σweight`.
- Weighted Module CGPA = `Σ(weight × credit × gradePoint) / Σ(weight × credit)`.
- Values are rounded with `parseFloat(value.toFixed(4))`.

## Scripts

```bash
npm run dev        # Vite frontend only
npm run build      # Type-check and build
npm run preview    # Preview the production build
npm run typecheck  # Type-check app, config, and API
npm run lint       # ESLint
npm test           # Unit tests
npm run test:e2e   # Playwright tests (API routes are mocked)
```

## Testing

- Unit tests cover calculations and store behavior.
- E2E tests mock `/api/auth/*` and `/api/sheets/sync`, so no Google account or
  database is needed to run them.

## Known Limitations

- Google Sheets is not a transactional database; simultaneous edits from
  multiple devices can conflict.
- Google API quotas and OAuth verification apply.
- If a user revokes access, they must sign in again.
- `npm audit` currently reports vulnerabilities in the dependency tree.
