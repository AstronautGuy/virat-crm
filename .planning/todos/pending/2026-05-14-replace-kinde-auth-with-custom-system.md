---
created: 2026-05-14T12:18:40Z
title: Replace Kinde Auth with custom employee code/password system
area: auth
files:
  - src/server/api/trpc.ts
  - src/server/db/schema/users.ts
---

## Problem

The current system relies on Kinde for authentication. The user wants to remove Kinde entirely and implement a custom authentication system where employees login using their unique employee code and a password.

## Solution

1. **Schema Update**: Update `src/server/db/schema/users.ts` to include `password` (hashed) and ensure `employeeCode` is unique and mandatory for login.
2. **Auth Logic**: Implement a custom authentication layer (e.g., using JWT or sessions).
3. **TRPC Context**: Update `src/server/api/trpc.ts` to retrieve the user based on the custom auth token/session instead of Kinde's session.
4. **Cleanup**: Remove Kinde-specific routes, environment variables, and dependencies.
5. **UI Update**: Create a new login page that accepts `employeeCode` and `password`.
