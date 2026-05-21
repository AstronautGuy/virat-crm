<!-- generated-by: gsd-doc-writer -->

## Local Setup

To set up the project for development:

1. Follow the [GETTING-STARTED.md](GETTING-STARTED.md) guide to clone the repo, install dependencies, and configure environment variables.
2. The project uses `pnpm` as the primary package manager. Run `pnpm install` rather than `npm install` for consistency.

## Build Commands

The following commands are available via the `scripts` section in `package.json`:

| Command                | Description                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`          | Starts the Next.js development server with Turbopack enabled.                      |
| `npm run build`        | Builds the Next.js application for production.                                     |
| `npm run start`        | Starts the Next.js production server (requires `build` first).                     |
| `npm run preview`      | Runs a production build and immediately starts the server.                         |
| `npm run lint`         | Runs ESLint to check for code quality issues.                                      |
| `npm run lint:fix`     | Runs ESLint and automatically fixes fixable issues.                                |
| `npm run format:check` | Checks code formatting against Prettier rules.                                     |
| `npm run format:write` | Automatically formats all supported files using Prettier.                          |
| `npm run typecheck`    | Runs the TypeScript compiler to check for type errors without emitting files.      |
| `npm run check`        | Runs both linting and type checking sequentially.                                  |
| `npm run db:generate`  | Generates Drizzle ORM SQL migration files based on schema changes.                 |
| `npm run db:migrate`   | Applies generated SQL migrations to the database.                                  |
| `npm run db:push`      | Pushes schema changes directly to the database without generating migration files. |
| `npm run db:studio`    | Opens Drizzle Studio, a visual GUI for exploring your database.                    |

## Code Style

The project enforces code quality and consistency using the following tools:

- **ESLint**: Configured via `eslint.config.*` (or similar Next.js defaults) to enforce JavaScript and TypeScript best practices. Run `npm run lint` to check.
- **Prettier**: Handles code formatting. Tailwind CSS classes are automatically sorted via the `prettier-plugin-tailwindcss` plugin. Run `npm run format:write` to format your code.
- **TypeScript**: Strict type checking is enabled. Ensure your code passes `npm run typecheck` before pushing.

## Branch Conventions

We use a standard feature-branch workflow. Please name your branches descriptively:

- `feat/feature-name`: For new features
- `fix/bug-description`: For bug fixes
- `chore/task-name`: For maintenance tasks, dependency updates, etc.
- `docs/doc-name`: For documentation updates

The main branch is `dev` for active development, and `main` for production releases.

## PR Process

To submit a pull request:

1. Create a branch following the conventions above.
2. Ensure your code is formatted (`npm run format:write`) and passes linting and type checking (`npm run check`).
3. Make sure all tRPC routes are properly typed and role-protected using Kinde Auth middleware.
4. Open a Pull Request targeting the `dev` branch.
5. Provide a clear description of the changes.
6. A maintainer will review your code before merging.
