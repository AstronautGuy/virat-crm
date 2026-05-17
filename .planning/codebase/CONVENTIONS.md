# Coding Conventions

**Analysis Date:** 2026-05-17

## Naming Patterns

**Files:**
- **Web/Server:** Use `kebab-case.ts` for modules, routes, helpers, and schemas. Use `PascalCase.tsx` for all React UI components.
- **Mobile:** Use `kebab-case.dart` for all Dart source files (screens, widgets, models, repositories).
- **Barrel Files:** Use `index.ts` to export directory members (barrel exports).

**Functions:**
- Use `camelCase` for all functions.
- Event handlers are prefixed with `handle` (e.g. `handleSubmit`, `handlePulse`).
- Native mobile hooks and entry points use standard prefixes (e.g. `onStart`, `onIosBackground`).

**Variables:**
- Use `camelCase` for general variables.
- Use `UPPER_SNAKE_CASE` for global, immutable constants (e.g. `BUCKET_NAME`, `MAX_RETRIES`).
- Use the underscore `_` prefix strictly to denote intentionally unused parameters in callback parameters (e.g. `_` or `_ctx` to bypass unused parameters warnings).

**Types:**
- Use `PascalCase` for type definitions, interfaces, and classes. Do not use Hungarian notation (e.g. do not prefix interfaces with `I`).
- Enums use `PascalCase` for the enum name and `PascalCase` or `UPPER_CASE` for the values.

## Code Style

**Formatting:**
- **Web/Server:** Standardized using **Prettier** with 2-space indentation, trailing commas, and semicolons. Class ordering inside React elements is handled automatically by `prettier-plugin-tailwindcss`.
- **Mobile:** Standardized using the native `flutter format` tool.

**Linting Rules:**
- **Web/Server:** Configured in `eslint.config.js` extending `@typescript-eslint` recommended stylistic flat configs.
- **Safety check (Drizzle):** Strict rules `drizzle/enforce-delete-with-where` and `drizzle/enforce-update-with-where` throw errors at compile time if a `.delete()` or `.update()` query is executed without a explicit `.where()` clause.
- **Mobile:** Configured in `mobile/analysis_options.yaml` extending standard `package:flutter_lints/flutter.yaml`.

## Import Organization

**Web/Server Order:**
1. External core packages (e.g. `react`, `drizzle-orm`, `@trpc/server`).
2. Internal absolute assets (using `@/*` resolving to `src/*`).
3. Relative files (e.g. `../utils`, `./styles`).
4. Type imports (e.g. `import type { User }` sorted as type-imports).

*Import groups are separated by a single blank line, and alphabetically organized within each group.*

## Error Handling

**Strategy:**
- **Fail Fast:** Input validation occurs immediately at boundaries (Zod validation for tRPC parameters; local form validation on client UI).
- **Procedures:** Use `TRPCError` to bubble up expected API validation and RBAC failures to clients:
```typescript
throw new TRPCError({
  code: "FORBIDDEN",
  message: "Manager or Admin role required."
});
```
- **Async Execution:** Use `try/catch` blocks inside async actions. Avoid chain-based `.catch()` resolutions.
- **Logging before throw:** Crucial logs or trace values are captured in console/file stores before error propagation is triggered.

## Logging

- **Server timing watcher:** Built-in tRPC timing middleware intercepts every procedure call and prints execution latency to standard stdout logs: `[TRPC] <path> took <n>ms to execute`.
- **Security exceptions:** Access denials, bad JWT signatures, and feature gate blocks are logged as `[SECURITY]` warning labels to easily identify potential malicious activity.

## Comments

**Guidelines:**
- Focus on documenting the *why* of the logic, rather than the *what*.
- Complicated algorithms, security mitigations, and database transaction lockups must contain block-level explanations.
- **TODO Comments:** Standardized format: `// TODO: description` or `// TODO(issue-number): description`.

## Function Design

- **Early Returns:** Use guard clauses to exit functions early if assumptions fail, avoiding deeply nested `if/else` ladders.
- **Size Limit:** Keep functions under 50 lines. Large blocks of logic must be extracted into focused helper utilities.
- **Parameters:** A maximum of 3 arguments is preferred. Functions requiring more than 3 parameters must pass a structured configuration/options object (e.g. `createSale(options: SaleOptions)`).

## Module Design

- **Named Exports:** Highly preferred for backend modules, helper utilities, and models.
- **Default Exports:** Reserved exclusively for Next.js App Router page components (`page.tsx`) and layout boundaries (`layout.tsx`).

---

*Convention analysis: 2026-05-17*
*Update when patterns change*
