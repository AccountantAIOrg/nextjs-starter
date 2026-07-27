# Krutai Next.js Template

This is a Next.js app template for Krutai projects. Use this README together with `AI_RULES.md` as the project guide for setup, package choices, and existing app wiring.

## Current status

- Authentication is already implemented with `@krutai/auth`.
- The typed tRPC API is available under `src/app/api/trpc/[trpc]`.
- Client auth state is exposed through `src/hooks/use-auth.ts`.
- Sign-in and sign-up pages are already available under `src/app/(auth)`.
- The navbar is already implemented in `src/components/navbar.tsx` and attached globally in `src/app/layout.tsx`, so it appears around `src/app/page.tsx` and the rest of the app pages.

## Getting started

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

```bash
bun run dev
bun run build
bun run start
```

`bun run build` runs `prisma generate` before the Next.js build.

## AI rules: task to package

Use `AI_RULES.md` as the canonical guide for which Krutai packages to use. Prefer these packages over ad-hoc libraries or alternate stacks when the task matches the area below.

| Area | Always use | Do not substitute with |
| --- | --- | --- |
| Authentication and sessions | `@krutai/auth` | Raw `better-auth` wiring in app code without going through this template's integration pattern |
| Database engine | PostgreSQL | SQLite, MySQL, or other primary application persistence by default |
| KrutAI-managed database config | `@krutai/db-service` | Hard-coded KrutAI database URLs or custom config fetchers |
| LLM and AI calls, streaming chat | `@krutai/ai-provider` | Direct vendor SDKs when `@krutai/ai-provider` already covers the use case |
| Live voice AI conversations | `@krutai/ai-live-conversation` | Hand-rolled browser audio/WebSocket flows for supported Gemini Live voice features |
| Email OAuth, list/read, send, filter | `@krutai/email-services` | One-off Gmail API fetches or random SMTP helpers for supported flows |
| Excel and spreadsheet compare | `@krutai/excel-comparison` | Manual `xlsx` or `exceljs` diff logic for supported comparison features |
| MCP server connections and tool calls | `@krutai/mcp-client` | Direct MCP transport/OAuth/session handling when the Krut backend should manage it |
| Role-based access control | `@krutai/rbac` | Custom permission engines for standard role/permission checks |
| File upload and retrieval | `@krutai/uploadfile-services` | One-off S3 upload clients or custom file retrieval wrappers for KrutAI-backed files |
| Background jobs and workers | `@krutai/worker` | Raw BullMQ setup when jobs should use KrutAI worker config and management |


All Krutai SDK-style packages expect `KRUTAI_API_KEY` and any related package-specific environment variables unless the code path is purely local.

## Auth implementation notes

Treat `@krutai/auth` as the single entry point for sign-in, sign-out, sessions, and other auth flows. Do not add a parallel Better Auth setup for the same app.

Relevant files:

- `src/lib/krutai-server.ts` initializes `KrutAuth`.
- `src/app/api/trpc/[trpc]/route.ts` exposes the tRPC API at `/api/trpc`.
- `src/server/api/root.ts` merges the tRPC routers.
- `src/server/api/routers/auth.ts` handles email sign-in, sign-up, sign-out, and session reads.
- `src/server/api/routers/users.ts` exposes user queries backed by Prisma.
- `src/hooks/use-auth.ts` exposes auth mutations and session state to client components.
- `src/components/navbar.tsx` renders sign-in/sign-up buttons for guests and a user menu for signed-in users.
- `src/app/layout.tsx` wraps every page with the tRPC-enabled `QueryProvider`, `TooltipProvider`, `Toaster`, and `Navbar`.


## Project structure

```text
src/app                 App Router pages, layouts, and API routes
src/app/(auth)          Sign-in and sign-up pages
src/app/api/trpc        tRPC route handler
src/components          Shared app components
src/components/ui       Reusable UI primitives
src/hooks               Client hooks
src/lib                 Server utilities and shared helpers
src/server/api          tRPC context, root router, and feature routers
prisma                  Prisma schema and database configuration
```

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [AI_RULES.md](./AI_RULES.md)
