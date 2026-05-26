# Testing

**Date Mapped:** 2026-05-26

## 1. Testing Framework
- **Primary Tool**: There is a `tests` directory containing test files (e.g., `validation.test.ts`), though a specific test runner (like Jest or Vitest) isn't explicitly defined in `package.json` scripts at the moment.

## 2. Structure & Coverage
- **Location**: Top-level `tests/` folder is used for validation and unit tests.
- **Types of Tests**: The presence of `validation.test.ts` indicates an emphasis on schema and data validation testing, likely validating the complex Drizzle and Zod schemas that power the CRM.

## 3. CI/CD Practices
- **Type Checking**: `npm run typecheck` (`tsc --noEmit`) is run alongside linting to verify static types.
- **Formatting**: `prettier --check` is configured for CI pipelines.
- **Linting**: `next lint` is standard practice before builds.
