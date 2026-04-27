# Phase 1: Authentication & Access Control - Research

**Gathered:** 2026-04-27

## Objective
Research the technical approach for implementing Kinde Auth with Next.js App Router and integrating it securely with tRPC middleware, per the Phase 1 goals and decisions.

## 1. Kinde Auth Setup in Next.js (App Router)

### Installation & API Route
- **Package**: `@kinde-oss/kinde-auth-nextjs`
- **Route Handler**: Requires creating `app/api/auth/[kindeAuth]/route.ts` which exports `handleAuth()` from the Kinde SDK. This single file handles `/login`, `/register`, `/logout`, and callback routes.

### Custom Domain & Post-Login Redirect
- The custom domain (`auth.yourdomain.com`) is strictly configured via the Kinde Dashboard (DNS CNAME records). The environment variables in `.env` must reflect this custom domain as the `KINDE_ISSUER_URL`.
- Post-login redirect (`/dashboard`) is configured via the `KINDE_POST_LOGIN_REDIRECT_URL` environment variable. 

### Session Management (Persistent Login)
- Persistent Login (30 days) is primarily configured in the Kinde Dashboard under App Settings > Tokens and Session. 
- The `@kinde-oss/kinde-auth-nextjs` SDK automatically handles HTTP-only cookies to store the session tokens securely.

## 2. Server-Side Extraction & UX Conditonal Rendering

- **Pattern**: Next.js App Router makes it trivial to extract auth state in Server Components. 
- **Method**: Use `getKindeServerSession()` from `@kinde-oss/kinde-auth-nextjs/server`.
- **Usage for conditional UI**: 
  ```tsx
  import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
  
  export default async function Layout({ children }) {
    const { getPermission, getUser } = getKindeServerSession();
    const adminPermission = await getPermission("admin:access"); // returns { isGranted: boolean }
    const user = await getUser();
    
    return (
      <nav>
        {adminPermission?.isGranted && <AdminButton />}
      </nav>
    );
  }
  ```
- **Note on Permissions vs Roles**: Kinde recommends checking *permissions* (e.g., `admin:access`) rather than raw roles. However, if the raw role is needed, `getClaim('roles')` can be used.

## 3. tRPC Middleware Integration (Server-Side RBAC)

To strictly enforce security on the backend, the tRPC context must be hydrated with the Kinde session.

### Context Setup (`src/server/api/trpc.ts`)
```typescript
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const createTRPCContext = async (opts: { req: Request }) => {
  const { getUser, getPermission } = getKindeServerSession();
  const user = await getUser();
  // Optional: pre-fetch specific permissions if needed for context
  
  return {
    ...opts,
    user,
    getPermission, // pass the function down for fine-grained procedure checks
  };
};
```

### Middleware (`protectedProcedure` / `adminProcedure`)
```typescript
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.user.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { user: ctx.user }
  });
});

const isAdmin = t.middleware(async ({ ctx, next }) => {
  const adminPermission = await ctx.getPermission("admin:access");
  if (!adminPermission?.isGranted) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAuthed).use(isAdmin);
```

## 4. Ecode Mapping Strategy

The requirement is to map the legacy `ecode` to the Kinde `username` or a custom property.
- Kinde supports custom user properties. We can define `ecode` as a custom property in the Kinde Dashboard.
- Once defined, it can be included in the ID Token or Access Token claims.
- The server can extract it using: `const ecode = await getClaim("ext_ecode");`
- Alternatively, if mapping `ecode` directly to Kinde's standard `username` field (if email is not the primary ID), then `user.username` or `user.email` can be used interchangeably depending on Kinde tenant config.

## Summary of Files to Modify/Create for Planner:
1. `.env` / `.env.example` - Add Kinde env vars.
2. `app/api/auth/[kindeAuth]/route.ts` - Setup SDK handler.
3. `src/server/api/trpc.ts` - Hydrate context and create `protectedProcedure` & `adminProcedure`.
4. `src/app/layout.tsx` (or similar RootLayout) - Provide Kinde context (if using client components that need auth state via `<KindeProvider>`) or demonstrate server-side fetching.
5. Create a `middleware.ts` at the root if page-level protection is desired alongside tRPC protection (Kinde provides `withAuth`).

## Validation Architecture

### Verification Dimensions (Nyquist)
- **Code**: Does `app/api/auth/[kindeAuth]/route.ts` exist? Is `tRPC` context hydrated with `getKindeServerSession`?
- **Logic**: Does `protectedProcedure` throw `UNAUTHORIZED` when no user is present? Does `adminProcedure` throw `FORBIDDEN`?
- **Integration**: Can the Next.js server successfully read Kinde's environment variables?
