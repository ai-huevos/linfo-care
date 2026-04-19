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

**Entry flow:** `src/main.jsx` → `src/App.jsx` wraps the tree in `<AuthProvider>` and a `<BrowserRouter>` with lazy-loaded route components and a `<ProtectedRoute>` guard. Pages are grouped by domain under `src/pages/{medical,family,care,reference}/`.

**Auth (`src/lib/auth.jsx`):** Supabase magic-link OTP via `AuthContext` + `useAuth()`. If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing, `auth.jsx` falls back to a hardcoded `DEMO_USER` so the app still runs for development without credentials. Do not remove this fallback without asking.

**Data (`src/lib/supabase.js`, `src/lib/useSupabase.js`):** Singleton Supabase client + helpers like `getPatientId()`. Schema is declared in `linfo-care-app/supabase/migration.sql` (14 tables: patients, treatment_phases, lab_results, medical_questions, journal_entries, medications, care_shifts, daily_checklist, inventory_items, documents, activity_log, ai_conversations, profiles, plus a `storage.buckets` entry for `documents`). RLS is enabled; a trigger auto-creates a profile row on auth signup.

**AI chat ("Doctora Lío"):** Frontend in `src/pages/Chat.jsx` streams from `/api/chat`, which Netlify rewrites (see `netlify.toml`) to `netlify/functions/chat.mjs`. That function uses `@ai-sdk/openai` with `gpt-4o-mini` and `streamText().toDataStreamResponse()`. The system prompt embeds full patient context (Roro, DLBCL Stage IV, labs, protocols). Env var: `OPENAI_API_KEY`. A local fallback in `Chat.jsx` (`generateLocalResponse`) handles a few keyword queries when the function is unreachable.

**Shared UI (`src/components/ui/index.jsx`):** `Card` (with `tone` prop: default/warn/critical/safe/info/muted), `Pill`, `SectionTitle`, `SaveIndicator`, `DrugRow`, `TimelineStep`, `ScenarioCard`, `LabChart`. New pages should compose these rather than re-rolling containers.

**Layout (`src/components/layout/`):** `Layout.jsx` hosts `Sidebar.jsx` (section-grouped nav with expandable children) + `TopBar.jsx`. To add a page, (1) add a `lazy()` import and `<Route>` in `App.jsx`, and (2) add a child entry to the matching section in `Sidebar.jsx`.

## Conventions

- **Language:** All user-facing copy is Spanish (es). The patient is "Roro". Do not translate to English.
- **File type:** `.jsx` with default-exported functional components. Top imports usually go: React/hooks → `lucide-react` icons → `'../../components/ui'` → `auth`/`supabase` when needed.
- **Styling:** Tailwind utility classes. Palette uses stone (neutral), sky (primary), rose (critical), amber (alert), emerald (safe). No dark mode is configured. Fonts: Playfair Display (serif headings) + Inter (body), loaded in `src/index.css`.
- **Deployment:** Vercel. `vercel.json` configures the build command and output directory. SPA routing handled by Vercel's default rewrites. `dist/` is the publish dir. An `api/chat` serverless function (Vercel Edge) replaces the former Netlify function.
- **Environment:** `.env.local` holds `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `OPENAI_API_KEY`. `.env.example` documents the shape.

## What *not* to do

- Don't introduce TypeScript, Redux/Zustand, or CSS modules — the project is deliberately minimal.
- Don't delete the demo-user fallback in `auth.jsx`.
- Don't commit `.env.local` or generate new SQL migrations without the user asking.
