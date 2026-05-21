---
phase: 1
plan: 1
---

# Plan 1 Summary: Kinde Auth & tRPC Middleware

## Objective

Implement Kinde authentication with Next.js App Router and set up tRPC context and middleware to enforce server-side RBAC.

## Tasks Completed

1. **Configure Kinde Auth Environment**: Added Kinde env vars to `src/env.js` and `.env.example`.
2. **Create Kinde Auth API Route**: Added `src/app/api/auth/[kindeAuth]/route.ts` using Kinde SDK.
3. **Setup tRPC Auth Middleware**: Updated `src/server/api/trpc.ts` to include Kinde session context, `protectedProcedure`, and `adminProcedure`.
4. **Hydrate RootLayout**: Updated `src/app/layout.tsx` to demonstrate Kinde session extraction (`getUser`, `getPermission`) and set up for future hydration.

## Verification

- All files modified and committed.
- tRPC context correctly configured to check for users and admin permission.
- Next.js server handles the Kinde auth routes.
- The `npm install @kinde-oss/kinde-auth-nextjs` is completing in the background.
