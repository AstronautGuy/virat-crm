# Phase 1: Authentication & Access Control - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Kinde Auth setup, tRPC middleware implementation for strict server-side RBAC, and session management using HTTP-only cookies. Replaces legacy client-side auth.
</domain>

<decisions>
## Implementation Decisions

### Kinde Configuration Strategy
- **D-01:** Use a custom domain (e.g., `auth.yourdomain.com`) for a professional look instead of the default Kinde subdomain.
- **D-02:** After a successful login, redirect users to the main `/dashboard`.

### Role Management Sync & UX
- **D-03:** Extract the user's role server-side directly from the Kinde token during Next.js layout rendering.
- **D-04:** Pass the server-extracted role down to the client to safely and efficiently conditionally render UI elements (like hiding Admin buttons) without requiring additional client-side token decoding.

### Session Expiry & Refresh
- **D-05:** Configure a Persistent Login policy (e.g., 30 days) to optimize for low-friction daily punch-ins on the employees' mobile devices.

### the agent's Discretion
- Exact naming of custom token properties if necessary to map `ecode` to `username`.
- Next.js middleware routing logic (which routes are protected vs public).
</decisions>

<specifics>
## Specific Ideas

- The primary use case is mobile punch-ins for the workforce; hence, persistent login is prioritized over daily timeout for better UX.
- The `ecode` needs to map to Kinde properly to maintain compatibility with employee records.
</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Authentication & Access
- `.planning/REQUIREMENTS.md` — Requirements AUTH-01, AUTH-02, AUTH-03.
- `.planning/PROJECT.md` — Security constraints regarding server-side validation.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None specifically for auth yet (legacy Base44 auth is being replaced entirely).

### Established Patterns
- Standard T3 App Router setup with `src/server/api/trpc.ts` acting as the gateway for RBAC.

### Integration Points
- `src/app/layout.tsx` (for server-side token reading and passing state to providers if necessary)
- `src/server/api/trpc.ts` (for implementing the `adminProcedure` / `protectedProcedure`)
</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>
