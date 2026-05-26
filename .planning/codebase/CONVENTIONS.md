# Conventions

**Date Mapped:** 2026-05-26

## 1. Code Style
- **Linter**: ESLint (Next.js preset) using the new flat config (`eslint.config.js`).
- **Formatter**: Prettier (`prettier.config.js`) configured with `prettier-plugin-tailwindcss` for class sorting.
- **Language**: Strict TypeScript (`tsconfig.json`) across the stack.

## 2. Naming Patterns
- **Files**: Kebab-case for React components, hooks, and pages (e.g., `use-location-breadcrumbs.ts`).
- **Types/Interfaces**: PascalCase for type definitions and interfaces.
- **Variables**: camelCase for variables and function names.

## 3. Error Handling
- **API Boundary**: Zod is heavily used for request validation (`z.object({...})`). tRPC procedures throw `TRPCError` for structured error responses.
- **Client**: Forms use `react-hook-form` connected with `@hookform/resolvers/zod` to provide client-side validation errors seamlessly.

## 4. Components
- **UI Architecture**: shadcn/ui approach (Tailwind + Radix UI primitives) where components are owned by the project rather than an opaque node_module.
- **Props**: Destructured with explicit TS interfaces.
