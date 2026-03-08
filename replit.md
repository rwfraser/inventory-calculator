# Tax Forms — 2023 Federal Tax Return Data Entry

## Overview
A multi-user web application for 2023 federal tax return data entry. Users register/login, create returns, enter taxpayer identity info and W-2 forms via IRS-accurate layouts. W-2 data is processed into a pipeline schema with aggregated income/payment totals, provenance records, and diagnostic warnings.

## Architecture
- **Frontend**: React + TypeScript with Vite, TailwindCSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: bcrypt password hashing, express-session + connect-pg-simple
- **Routing**: wouter (frontend), Express (backend API)
- **Styling**: Space Grotesk (sans), JetBrains Mono (mono), light/dark mode

## Key Files
- `shared/schema.ts` — Database schema (users, tax_returns, session tables) + Drizzle types
- `shared/types/pipeline.ts` — Pipeline TypeScript types (ReturnData, W2Document, IdentitySection, etc.)
- `shared/types/w2-validation.ts` — Zod validation schemas for W-2 and identity forms
- `server/auth.ts` — Auth middleware (requireAuth), session config, login/register/logout routes
- `server/routes.ts` — API routes (returns CRUD, W-2 CRUD, identity, processing)
- `server/storage.ts` — Storage interface + PostgreSQL implementation
- `server/processing/w2-processor.ts` — W-2 aggregation, provenance, diagnostics
- `client/src/App.tsx` — Router with protected routes, ThemeProvider, AuthProvider
- `client/src/components/layout.tsx` — App layout (header, footer, theme toggle)
- `client/src/hooks/use-auth.tsx` — Auth context/hook (login, register, logout, user state)
- `client/src/hooks/use-theme.tsx` — Dark mode theme provider with localStorage persistence
- `client/src/pages/dashboard.tsx` — Tax returns list, create/delete returns
- `client/src/pages/return-detail.tsx` — Return detail with tabs (Taxpayer Info, W-2 Forms)
- `client/src/components/w2-form.tsx` — Full IRS W-2 layout form (boxes a-f, 1-20, box 12/13/14, state/local)
- `client/src/components/w2-list.tsx` — W-2 list with per-form summary and aggregated totals
- `client/src/components/identity-form.tsx` — Taxpayer/spouse identity form
- `client/src/pages/login.tsx` — Login page
- `client/src/pages/register.tsx` — Registration page

## API Routes
- `POST /api/auth/register` — Create account (email, password)
- `POST /api/auth/login` — Sign in
- `POST /api/auth/logout` — Sign out
- `GET /api/auth/me` — Current user
- `GET /api/returns` — List user's returns
- `POST /api/returns` — Create new return
- `GET /api/returns/:id` — Get return
- `DELETE /api/returns/:id` — Delete return
- `PUT /api/returns/:id/identity` — Update taxpayer/spouse info
- `GET /api/returns/:id/w2` — List W-2s
- `POST /api/returns/:id/w2` — Add W-2
- `PUT /api/returns/:id/w2/:docId` — Update W-2
- `DELETE /api/returns/:id/w2/:docId` — Delete W-2
- `GET /api/returns/:id/processing` — Get processing results (income, payments, provenance, diagnostics)

## Pipeline Schema
- Version: `2023-return-pipeline-draft-v1`
- Tax year: 2023
- SS wage base: $160,200; SS rate: 6.2%; Medicare rate: 1.45%
- Processing runs automatically after every W-2 mutation
- Provenance records track source documents for each computed aggregate
- Diagnostics: SS wage base exceeded, SS/Medicare tax mismatches, duplicate employer EIN

## Database
- `users`: id (serial), email (unique), password_hash, created_at, updated_at
- `tax_returns`: id (serial), user_id (FK), tax_year, return_data (jsonb), status, created_at, updated_at
- `session`: connect-pg-simple session store

## GitHub Repository
- Repository: https://github.com/rwfraser/inventory-calculator
- Connected via Replit GitHub integration

## Dependencies
- bcrypt, connect-pg-simple, express-session (auth)
- drizzle-orm, drizzle-zod, @neondatabase/serverless (database)
- @tanstack/react-query (data fetching)
- wouter (routing)
- lucide-react (icons)
- tailwindcss, tailwindcss-animate, @tailwindcss/typography (styling)
