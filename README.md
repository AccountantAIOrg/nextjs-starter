# Krutai Next.js Template

This is a Next.js app template for Krutai projects. Use this README together with `AI_RULES.md` as the project guide for setup, package choices, and existing app wiring.

## Current status

- Authentication is already implemented with `@krutai/auth`.
- Auth API routes are available under `src/app/api/auth`.
- Client auth state is exposed through `src/hooks/use-auth.ts`.
- Sign-in and sign-up pages are already available under `src/app/(auth)`.
- The navbar is already implemented in `src/components/navbar.tsx` and attached globally in `src/app/layout.tsx`, so it appears around `src/app/page.tsx` and the rest of the app pages.

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

```bash
npm run dev
npm run build
npm run start
```

`npm run build` runs `prisma generate` before the Next.js build.

## AI rules: task to package

Use `AI_RULES.md` as the canonical guide for which Krutai packages to use. Prefer these packages over ad-hoc libraries or alternate stacks when the task matches the area below.

| Area | Always use | Do not substitute with |
| --- | --- | --- |
| Authentication and sessions | `@krutai/auth` | Raw `better-auth` wiring in app code without going through this template's integration pattern |
| Database engine | PostgreSQL | SQLite, MySQL, or other primary application persistence by default |
| LLM and AI calls, streaming chat | `@krutai/ai-provider` | Direct vendor SDKs when `@krutai/ai-provider` already covers the use case |
| Email OAuth, list/read, send, filter | `@krutai/email-services` | One-off Gmail API fetches or random SMTP helpers for supported flows |
| Excel and spreadsheet compare | `@krutai/excel-comparison` | Manual `xlsx` or `exceljs` diff logic for supported comparison features |

Current Krutai package versions are defined in `package.json`, including:

- `@krutai/auth` `^0.4.5`
- `@krutai/ai-provider` `^0.3.12`
- `@krutai/email-services` `^1.0.8`
- `@krutai/excel-comparison` `^0.1.1`
- `@krutai/mcp-client` `^0.1.1`
- `@krutai/worker` `^1.0.1`

All Krutai SDK-style packages expect `KRUTAI_API_KEY` and any related package-specific environment variables unless the code path is purely local.

## Auth implementation notes

Treat `@krutai/auth` as the single entry point for sign-in, sign-out, sessions, and other auth flows. Do not add a parallel Better Auth setup for the same app.

Relevant files:

- `src/lib/krutai-server.ts` initializes `KrutAuth`.
- `src/app/api/auth/sign-in/route.ts` handles email sign-in.
- `src/app/api/auth/sign-up/route.ts` handles email sign-up.
- `src/app/api/auth/sign-out/route.ts` handles sign-out.
- `src/app/api/auth/session/route.ts` reads the current session.
- `src/hooks/use-auth.ts` exposes auth mutations and session state to client components.
- `src/components/navbar.tsx` renders sign-in/sign-up buttons for guests and a user menu for signed-in users.
- `src/app/layout.tsx` wraps every page with `QueryProvider`, `TooltipProvider`, `Toaster`, and `Navbar`.


## Project structure

```text
src/app                 App Router pages, layouts, and API routes
src/app/(auth)          Sign-in and sign-up pages
src/app/api/auth        Authentication route handlers
src/components          Shared app components
src/components/ui       Reusable UI primitives
src/hooks               Client hooks
src/lib                 Server utilities and shared helpers
prisma                  Prisma schema and database configuration
```

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [AI_RULES.md](./AI_RULES.md)
