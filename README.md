# GPA Calculator

A high-fidelity React rebuild of the GPA Calculator at
`https://gpa.sarislabs.com/dashboard`. The app tracks semesters, modules, grades,
credits, SGPA/CGPA, analytics, settings, help, and feedback in the browser.

## Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS 4 with local shadcn/ui-style primitives
- React Router 7
- Zustand 5 with LocalStorage persistence
- Recharts for analytics
- Zod, React Toastify, Lucide icons
- Vitest for unit tests, Playwright for end-to-end tests

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

The demo account is prefilled. Use **Continue with Google** on the landing page
to sign in as:

```text
Demo Student
demo@student.com
```

Authentication is mocked locally; there is no backend or OAuth integration.

## Scripts

```bash
npm run dev        # Start the Vite dev server
npm run build      # Type-check and build for production
npm run preview    # Preview the production build
npm run typecheck  # Run TypeScript project checks
npm run lint       # Run ESLint
npm test           # Run Vitest unit tests
npm run test:e2e   # Run Playwright end-to-end tests
```

Playwright is configured to use the locally installed Google Chrome via
`channel: 'chrome'`. If Chrome is unavailable, install Playwright browsers and
remove that channel setting from `playwright.config.ts`. The local suite uses
two workers to avoid CPU contention; CI uses one.

## Features

- Dashboard with overall GPA, total credits, method selector, semester cards,
  module CRUD, semester CRUD, default-semester templates, and the new-feature
  banner.
- Two GPA methods: Weighted SGPA and Weighted Module CGPA.
- Analytics with GPA trend, grade distribution, credits per semester, target
  GPA calculator, and what-if projection.
- Settings for editable grade points and semester weights. Semester weights are
  persisted only after **Save Changes**.
- Help guide generated from the captured reference content.
- Feedback form with validation and local persistence.
- Responsive desktop and mobile navigation.
- All data is stored in `localStorage`; no server is required.

## GPA Logic

- SGPA = `Σ(point × credit) / Σcredit`, skipping NGPA modules and modules with
  credits less than or equal to zero.
- Total credits include NGPA credits.
- Weighted SGPA = `Σ(SGPA × weight) / Σweight`.
- Weighted Module CGPA = `Σ(weight × credit × gradePoint) / Σ(weight × credit)`.
- Results are rounded with `parseFloat(value.toFixed(4))`.

## Data and Storage

- `gpa-data` stores semesters, grade scale, GPA method, banner state, and
  feedback.
- `gpa-auth` stores the mocked signed-in user.

Default data contains eight semesters with weights
`0.05, 0.05, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15` and the preset module lists
from the reference app.

### Reference Quirk

Preset modules use a lowercase `"c"` grade. The reference renders this as a
blank option in the uppercase grade selector while still calculating it as a
C/2.0. This behavior is preserved intentionally.

## Deliberate Deviations

- Google OAuth is replaced by a local demo sign-in.
- Adding a module persists immediately instead of requiring a separate save.
- Preset module IDs are regenerated when added to avoid duplicate React keys.
- The app uses local shadcn/ui-style components rather than a generated
  `components.json` setup.

## Project Structure

```text
src/
  components/
    layout/          Header, sidebar, app shell
    shared/          Loader, modal, confirm dialog, form input
    ui/              Button, input, label, textarea, dialog
  features/
    analytics/       Charts, target GPA, what-if simulator
    auth/            Landing, sign-in, auth store
    dashboard/       Dashboard page, semester cards, module rows, modals
    feedback/        Feedback page
    gpa/             Types, calculations, store, default data, tests
    help/            Help page and captured content
    settings/        Grade scale and semester weight settings
  lib/               Utilities and ID generation
  test/              Vitest setup
e2e/                 Playwright specs and helpers
_analysis/           Reference captures, scripts, and extracted chunks
```

## Testing

- Unit tests cover GPA calculations and store behavior.
- E2E tests cover landing/sign-in, dashboard CRUD, analytics, settings,
  feedback, help, and responsive navigation.

## Known Limitations

- `npm audit` currently reports three vulnerabilities in the dependency tree;
  they have not been triaged.
- The production bundle is split at the analytics route. Vite may still warn
  about large vendor chunks.
