# AI rules for this repo (`krutai-nextjs-template`)

Use this file as the canonical guide for **which Krutai packages to use** and **what they are for**. Prefer these packages over ad-hoc libraries or alternate stacks when the task matches the column below.

All Krutai SDK-style packages in this project expect a `**KRUTAI_API_KEY`** (and related env vars per package docs) unless the code path is purely local.

---

## Quick map: task → package


| Area                                  | Always use                 | Do not substitute with                                                                                          |
| ------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Authentication & sessions             | `@krutai/auth`             | Raw `better-auth` wiring in app code without going through this package’s integration pattern for this template |
| Database URL / Postgres config        | `@krutai/db-service`       | Hard-coded `DATABASE_URL` in source, or non-Postgres primary stores for app data                                |
| **Database engine**                   | **PostgreSQL**             | SQLite / MySQL / etc. for primary application persistence                                                       |
| LLM / AI calls, streaming chat        | `@krutai/ai-provider`      | Direct vendor SDKs in app code when `@krutai/ai-provider` already covers the use case                           |
| Email: OAuth, list/read, send, filter | `@krutai/email-services`   | One-off `fetch` to Gmail APIs, or random SMTP helpers, when this package is the standard here                   |
| Excel / spreadsheet compare           | `@krutai/excel-comparison` | Manual `xlsx`/`exceljs` diff logic for the same “compare files” product feature                                 |


Package versions are defined in `package.json` (e.g. `@krutai/auth` ^0.2.3, `@krutai/db-service` ^1.0.1, `@krutai/ai-provider` ^0.2.15, `@krutai/email-services` ^1.0.3, `@krutai/excel-comparison` ^0.0.8).

---

## `@krutai/auth`

- **Use for:** sign-in, sign-out, sessions, and any server/client auth flows this project standardizes on via Krutai.
- **Implementation notes (from dependency graph):** the package builds on `**better-auth`** and related DB drivers used by that stack. In this monorepo template, treat `**@krutai/auth` as the single entry** for auth—extend or configure through it rather than duplicating a parallel Better Auth setup.
- **When implementing:** import and wire auth according to `@krutai/auth` exports and patterns; do not introduce a second auth stack for the same app unless explicitly required.

---

## `@krutai/db-service` + PostgreSQL

- **Use for:** resolving the database **connection URL/config** through the Krutai DB service client (e.g. `DbService` / `getDbConfig()` style usage).
- **Rule:** the **primary database is PostgreSQL**. Use the URL/config returned by `@krutai/db-service` for Prisma, Drizzle, `pg`, or other Postgres clients—keep secrets out of committed source.
- **Do not:** point the main app at a different RDBMS by default, or embed production URLs in the repo.

---

## `@krutai/ai-provider`

- **Use for:** chat completions, streaming responses, and other LLM features exposed by this provider (e.g. `krutAI` / streaming helpers as documented in package or `AGENT.md`).
- **Do not:** bypass it for routine AI features already covered here, unless there is a documented exception.

---

## `@krutai/email-services`

- **Note:** the installed npm package name is `**@krutai/email-services`** (plural), not `email-service`.
- **Use for:** Google OAuth–backed email flows, **reading** messages, **sending** mail, and **filtering** / query-style operations exposed by `EmailServiceClient` and related types (e.g. filter options).
- **Do not:** reimplement the same OAuth + Gmail operations ad hoc when this client is available.

---

## `@krutai/excel-comparison`

- **Use for:** comparing Excel/spreadsheet files (file-object or API-oriented flows), using the package’s client (e.g. `krutExcelComparison` / comparison options types).
- **Do not:** hand-roll comparison pipelines with raw `xlsx`/`exceljs` for features this package already provides.

---

## How to use this file

1. Before adding a dependency or integration, check the table above.
2. For API shapes and code samples, prefer `**AGENT.md`** sections that match each package, and `**package.json**` for the exact install name and version range.

