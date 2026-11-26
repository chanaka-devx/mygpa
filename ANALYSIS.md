# Analysis and Rebuild Notes

## Reference

- Target: `https://gpa.sarislabs.com/dashboard`
- Captured material lives in `_analysis/`:
  - `chunks/`: extracted reference JavaScript for behavior and markup details
  - `captures/`: screenshots, HTML snapshots, and `help-info.json`
- The rebuild focuses on visual fidelity first, then behavior and persistence.

## Application Structure

The original is a Next.js app with a Google OAuth gate. This rebuild uses Vite,
React Router, and a mocked auth store. The dashboard shell consists of:

- Fixed primary sidebar on desktop, off-canvas drawer on mobile
- Header with GPA Calculator branding, account block, and logout
- Main content area with the reference primary/secondary colors
- Route pages for dashboard, analytics, settings, help, and feedback

Feature code is separated from GPA domain logic:

- `src/features/gpa`: pure calculations, types, default data, Zustand store
- `src/features/*`: page and feature components
- `src/components/ui` and `shared`: reusable UI primitives

## Visual Fidelity

Key reference details preserved:

- Primary color `#2b2b41`; secondary color `#193636`
- Geist variable font loaded from `public/fonts/geist-latin.woff2`
- Sidebar/header spacing, account block, and menu treatment
- Dashboard GPA/credit headings and method badge
- Blue new-feature banner with Sparkles icon and dismiss controls
- Semester cards with module tables, grade selectors, save/cancel/delete
  controls, SGPA, and total credits
- Analytics page title/subtitle: “Analytics & Progress” and “Track your academic
  performance and plan ahead”
- Target GPA calculator result states and exact result copy
- What-if simulator table, add/remove behavior, projected GPA, change, and total
  credits
- Settings grade-scale and semester-weight forms
- Help page rendered from captured reference HTML
- Responsive mobile navigation

Screenshots from the reference and rebuild were compared during implementation.

## GPA Behavior

- SGPA uses only modules with a positive credit value and a non-NGPA grade.
- Total credits include NGPA modules.
- Weighted SGPA uses semester weights.
- Weighted Module CGPA uses weight × credit × grade point.
- Both overall methods exclude NGPA modules.
- Values are rounded to four decimal places with `parseFloat(x.toFixed(4))`.

The reference default grade scale is represented in
`src/features/gpa/grade-scale.ts`.

## Persistence

The Zustand store persists to `gpa-data`. It includes:

- `semesters`
- `gradeList`
- `gpaMethod`
- `hasSeenGpaMethodNotification`
- `feedback`

The auth store persists to `gpa-auth`. The mocked user is `Demo Student` /
`demo@student.com`.

Semester weights are edited in local settings state and only committed to the
store when **Save Changes** is clicked, matching the reference interaction.

## Preserved Quirk

Preset modules use lowercase `"c"`. The grade `<select>` uses uppercase options,
so the value appears blank while calculations treat it as C/2.0. This was kept
because the reference does the same.

## Deliberate Deviations

- Mocked demo sign-in replaces Google OAuth.
- Adding a module writes to the store immediately; the reference requires a
  separate persistence action.
- Preset module IDs are regenerated when added to prevent duplicate keys.
- Local shadcn/ui-style primitives are used instead of a generated
  `components.json` workflow.
- The analytics route is lazy-loaded to split Recharts out of the main bundle.

## Verification

- `npm run typecheck`: passes.
- `npm run build`: passes.
- `npm run lint`: passes.
- `npm test`: 24 unit tests pass.
- `npm run test:e2e`: 10 Playwright tests pass locally with two workers.

## Remaining Risks

- `npm audit` reports three dependency vulnerabilities that have not been
  triaged.
- The analytics bundle is large because of Recharts; the route is lazy-loaded,
  but Vite may still report a large vendor chunk.
- E2E tests depend on locally installed Google Chrome through the Playwright
  `channel: 'chrome'` setting.
