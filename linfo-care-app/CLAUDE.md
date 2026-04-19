# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout quirk

The actual app lives in `linfo-care-app/`, not the repo root. The repo root also contains a legacy standalone `LymphomaCare.jsx` (pre-modularization snapshot, not wired into the build) and a `Research/` folder with reference material. **Run all dev/build/lint commands from `linfo-care-app/`.**

## Commands (run from `linfo-care-app/`)

- `npm run dev` — Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built bundle
- `npm run lint` — ESLint (flat config, `eslint.config.js`)

No test runner is configured. No formatter beyond ESLint. The project is JavaScript/JSX only — there is no TypeScript, no `tsconfig.json`, and no `.tsx` files.

## Architecture

**Stack:** Vite 8 + React 19 + React Router v7 + Tailwind CSS 3.4 + Supabase JS 2 + Vercel AI SDK v6 + `vite-plugin-pwa`.

**Entry flow:** `src/main.jsx` → `src/App.jsx` wraps the tree in `<AuthProvider>` and a `<BrowserRouter>` with lazy-loaded route components. All pages are public (no login gate). Pages are grouped by domain under `src/pages/{medical,family,care,reference}/`.

**Auth (`src/lib/auth.jsx`):** Dual-mode system:
- **Guest mode (default):** Family members access the entire app without login. A guest profile is assigned automatically. `isGuest = true`, `isAdmin = false`.
- **Admin mode:** Authenticated users (via magic link at `/admin/login`) with emails in `ADMIN_EMAILS` array get `isAdmin = true`. Admin-only operations: add/edit/delete data, upload documents, OCR extraction.
- `useAuth()` exposes: `user`, `isAdmin`, `isGuest`, `isMember`, `displayName`, `signInWithMagicLink`, `signOut`.
- If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing, falls back to a hardcoded `DEMO_USER`.

**Data (`src/lib/supabase.js`, `src/lib/useSupabase.js`):** Singleton Supabase client + helpers like `getPatientId()`. Schema is declared in `linfo-care-app/supabase/migration.sql` (15 tables: patients, treatment_phases, lab_results, medical_questions, journal_entries, medications, care_shifts, daily_checklist, inventory_items, documents, activity_log, ai_conversations, profiles, gift_requests, plus a `storage.buckets` entry for `documents`). RLS is enabled with `anon_read_*` policies for public SELECT access. A trigger auto-creates a profile row on auth signup.

**AI chat ("Doctora Lío"):** Frontend in `src/pages/Chat.jsx` streams from `/api/chat` (Vercel serverless function). Uses `@ai-sdk/openai` with `gpt-4o-mini` via Vercel AI Gateway (OIDC auth, no manual API key). The system prompt embeds full patient context (Roro, DLBCL Stage IV, labs, protocols). A local fallback in `Chat.jsx` (`generateLocalResponse`) handles keyword queries when the function is unreachable.

**OCR extraction (`/api/extract`):** Vercel serverless function that uses `gpt-4o` vision via Vercel AI Gateway to analyze medical documents (PDFs, images). Called from Documents.jsx when admin clicks the ✨ sparkle icon on a document card.

**Shared UI (`src/components/ui/index.jsx`):** `Card` (with `tone` prop: default/warn/critical/safe/info/muted), `Pill`, `SectionTitle`, `SaveIndicator`, `DrugRow`, `TimelineStep`, `ScenarioCard`, `LabChart`. New pages should compose these rather than re-rolling containers.

**Layout (`src/components/layout/`):** `Layout.jsx` hosts `Sidebar.jsx` (section-grouped nav with expandable children) + `TopBar.jsx`. To add a page, (1) add a `lazy()` import and `<Route>` in `App.jsx`, and (2) add a child entry to the matching section in `Sidebar.jsx`.

## Page-level access control

All pages are publicly readable. Write operations are gated behind `isAdmin`:

| Page | Guest (read) | Admin (write) |
|------|-------------|---------------|
| Medications | View list | Add/edit/delete |
| Lab Results | View charts & history | Add results |
| Documents | View & download | Upload, delete, OCR extract |
| Journal | Read entries | Write & delete entries |
| Care Shifts | Sign up (guest name prompt) | Full management |
| Inventory | View status | Toggle status, assign |
| Gift Requests | Submit offerings | View all |

## Conventions

- **Language:** All user-facing copy is Spanish (es). The patient is "Roro". Do not translate to English.
- **File type:** `.jsx` with default-exported functional components. Top imports usually go: React/hooks → `lucide-react` icons → `'../../components/ui'` → `auth`/`supabase` when needed.
- **Styling:** Tailwind utility classes. Palette uses stone (neutral), sky (primary), rose (critical), amber (alert), emerald (safe). No dark mode is configured. Fonts: Playfair Display (serif headings) + Inter (body), loaded in `src/index.css`.
- **Deployment:** Vercel. `vercel.json` configures the build command and output directory. SPA routing handled by Vercel's default rewrites. `dist/` is the publish dir. Serverless functions live in `api/` (chat.js, extract.js).
- **Environment:** `.env.local` holds `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. AI functions use Vercel AI Gateway with OIDC — no manual `OPENAI_API_KEY` needed.
- **Accessibility:** UX is designed for elderly family members (60-80 years). Large touch targets (min 44px), high-contrast text, clear CTA buttons, minimal cognitive load.

## What *not* to do

- Don't introduce TypeScript, Redux/Zustand, or CSS modules — the project is deliberately minimal.
- Don't delete the demo-user fallback in `auth.jsx`.
- Don't commit `.env.local` or generate new SQL migrations without the user asking.
- Don't add a login gate to the main app — it's intentionally public-first.
- Don't use the Supabase Edge Function for OCR — use the Vercel `/api/extract` route instead.
