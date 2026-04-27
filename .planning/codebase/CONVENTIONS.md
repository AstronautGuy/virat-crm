# Conventions

- **Component Structure:** Functional components, placed in relevant route folders or `_components`
- **Styling:** Tailwind CSS utility classes
- **Data Fetching:** Use tRPC (`api.*`) from Client Components and Server Components (via `HydrateClient`)
- **Database:** Define schema in `src/server/db/schema.ts` and use Drizzle ORM
- **Formatting:** Prettier and ESLint (Next.js config + typescript-eslint + drizzle plugin)
- **Environment Variables:** Checked at runtime/buildtime using `@t3-oss/env-nextjs` in `src/env.js`
