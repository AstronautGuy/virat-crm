---
wave: 1
depends_on: []
files_modified:
  - "src/env.js"
  - ".env.example"
  - "src/app/api/auth/[kindeAuth]/route.ts"
  - "src/server/api/trpc.ts"
  - "src/app/layout.tsx"
autonomous: true
---

# Plan 1: Kinde Auth & tRPC Middleware

## Goal

Implement Kinde authentication with Next.js App Router and set up tRPC context and middleware to enforce server-side RBAC.

## Tasks

### [Task 1] Configure Kinde Auth Environment

<read_first>

- src/env.js
- .env.example
  </read_first>

<action>
Update environment variables for Kinde Auth integration.
Add the following keys to `.env.example` and validation to `src/env.js` (both server and client side if needed, but primarily server):
- `KINDE_CLIENT_ID`
- `KINDE_CLIENT_SECRET`
- `KINDE_ISSUER_URL`
- `KINDE_SITE_URL`
- `KINDE_POST_LOGOUT_REDIRECT_URL`
- `KINDE_POST_LOGIN_REDIRECT_URL`
</action>

<acceptance_criteria>
`src/env.js` contains `KINDE_CLIENT_ID`, `KINDE_CLIENT_SECRET`, and `KINDE_ISSUER_URL`.
`.env.example` contains placeholders for these variables.
</acceptance_criteria>

### [Task 2] Create Kinde Auth API Route

<read_first>

- src/app/api/auth/[kindeAuth]/route.ts (this will be a new file)
  </read_first>

<action>
Create `src/app/api/auth/[kindeAuth]/route.ts`.
Export `GET` handler using `handleAuth()` from `@kinde-oss/kinde-auth-nextjs/server`.
</action>

<acceptance_criteria>
`src/app/api/auth/[kindeAuth]/route.ts` contains `export const GET = handleAuth();`.
</acceptance_criteria>

### [Task 3] Setup tRPC Auth Middleware

<read_first>

- src/server/api/trpc.ts
- .planning/phases/1/1-RESEARCH.md
  </read_first>

<action>
Update `src/server/api/trpc.ts` to include Kinde auth.
1. Import `getKindeServerSession` from `@kinde-oss/kinde-auth-nextjs/server`.
2. Update `createTRPCContext` to extract `user` using `await getKindeServerSession().getUser()`.
3. Update `createTRPCContext` to extract `getPermission` from `getKindeServerSession()`.
4. Create an `isAuthed` middleware that throws `TRPCError({ code: "UNAUTHORIZED" })` if `ctx.user` is absent.
5. Create an `adminProcedure` using `isAuthed` and a new `isAdmin` middleware that checks `await ctx.getPermission("admin:access")`. Throw `TRPCError({ code: "FORBIDDEN" })` if not granted.
</action>

<acceptance_criteria>
`src/server/api/trpc.ts` contains `export const protectedProcedure = t.procedure.use(isAuthed);`
`src/server/api/trpc.ts` contains `export const adminProcedure = t.procedure.use(isAuthed).use(isAdmin);`
</acceptance_criteria>

### [Task 4] Hydrate RootLayout with Auth State

<read_first>

- src/app/layout.tsx
  </read_first>

<action>
Update `src/app/layout.tsx` to conditionally render based on authentication state, or demonstrate fetching the user.
Import `getKindeServerSession` from `@kinde-oss/kinde-auth-nextjs/server`.
Extract `user` and `adminPermission = await getPermission("admin:access")`.
Log the user and admin status to verify server-side extraction is working.
</action>

<acceptance_criteria>
`src/app/layout.tsx` imports `getKindeServerSession`.
</acceptance_criteria>

## Verification

<requirements>
- AUTH-01: Implement Kinde Auth for employee login mapping `ecode` to username
- AUTH-02: Enforce strict server-side RBAC using tRPC middleware
- AUTH-03: Secure session management using HTTP-only cookies
</requirements>

<must_haves>

- tRPC context must have `user` object available.
- `protectedProcedure` throws UNAUTHORIZED for unauthenticated users.
- `adminProcedure` throws FORBIDDEN for non-admin users.
  </must_haves>
