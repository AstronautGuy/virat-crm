---
focus: quality
last_mapped_commit: HEAD
date: 2026-05-29
---

# CONVENTIONS.md

## Code Style
- **TypeScript**: Strict mode enabled. Prefer `interface` or `type` for definitions.
- **Formatting**: Prettier is used for code formatting (`pnpm format:write`). Tailwind classes are sorted automatically via `prettier-plugin-tailwindcss`.
- **Linting**: ESLint configured with Next.js defaults and Drizzle plugin (`pnpm lint`).

## Component Patterns
- Use Server Components by default. Add `"use client"` directive only when hooks or interactivity are needed.
- shadcn/ui components are stored in `src/components/ui/` and should rarely be modified unless global styling changes are needed.

## Error Handling
- Use `zod` for parsing and validating both environment variables and user input.
- Return explicit `TRPCError` in backend routers for anticipated failures.
