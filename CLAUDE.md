# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check + build (tsc -b && vite build)
pnpm lint         # ESLint
pnpm lint:fix     # ESLint with auto-fix
pnpm format       # Prettier write
pnpm format:check # Prettier check
```

Package manager is **pnpm**. There are no tests configured yet.

## Architecture

**Sprintlog** is an OKR + daily work log tracking app. Stack: React 19 + TypeScript + Vite + Tailwind CSS v4 + Supabase (backend/auth, not yet wired up) + Vercel (deployment).

### Planned pages (4 total)
- `/auth` — login / signup
- `/dashboard` — summary stats, today's todos, OKR progress
- `/okrs` — OKR CRUD
- `/work-logs` — monthly calendar view, work log create/edit modal

### Source layout
```
src/
  features/
    logs/       # LogsPage.tsx (calendar view), WorkLogModal.tsx
  types.ts      # WorkLog, OKR interfaces (referenced but not yet created)
  App.tsx
  main.tsx
  index.css
```

Feature code lives under `src/features/<domain>/`. Types are shared from `src/types`.

### Key conventions
- All create/edit UX goes through modals (work logs and OKRs).
- Save is always a single full save — no partial saves or optimistic rollback; on failure show a toast only.
- `archived` OKRs must be excluded from work-log OKR selection.
- `todo_morning` and `todo_afternoon` are stored as JSON strings (`"[]"`).

### Libraries in use
- `date-fns` — date arithmetic and formatting
- `motion/react` — animations
- `lucide-react` — icons
- `@locator/babel-jsx` — dev-only click-to-source (configured in vite.config.ts)

### Linting / formatting
- ESLint enforces `simple-import-sort` — imports must be sorted or CI will fail.
- Prettier runs via `eslint-config-prettier` integration; run `pnpm format` before committing.
