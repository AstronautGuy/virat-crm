<!-- generated-by: gsd-doc-writer -->

## Prerequisites

Before setting up the project, ensure you have the following installed and configured:

- **Node.js**: `>= 18.17.0`
- **Package Manager**: npm, pnpm, or yarn (pnpm is recommended as per `packageManager` field in `package.json`)
- **PostgreSQL**: A running instance of PostgreSQL
- **Kinde Auth**: A Kinde account for authentication
- **Cloudflare R2**: A Cloudflare account and R2 bucket for file storage

## Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/AstronautGuy/virat-crm.git
   ```

2. Navigate into the project directory:

   ```bash
   cd virat-crm
   ```

3. Install all dependencies:
   ```bash
   pnpm install
   # or npm install / yarn install
   ```

## First Run

1. **Environment Setup**: Copy the example environment file and fill in your secrets.

   ```bash
   cp .env.example .env.local
   ```

   Open `.env.local` and add your database URL, Kinde credentials, and R2 tokens.

2. **Database Initialization**: Push the database schema to your PostgreSQL instance.

   ```bash
   npx drizzle-kit push
   ```

3. **Start Development Server**: Run the Next.js development server.
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## Common Setup Issues

- **Database Connection Error**: Ensure your PostgreSQL service is running and the `DATABASE_URL` in `.env.local` matches your local credentials.
- **Authentication Redirect Failures**: If Kinde redirects to an error page, ensure that the `KINDE_SITE_URL`, `KINDE_POST_LOGOUT_REDIRECT_URL`, and `KINDE_POST_LOGIN_REDIRECT_URL` in `.env.local` exactly match the "Allowed callback URLs" in your Kinde application settings.
- **R2 Storage Errors**: Ensure your R2 bucket exists and the CORS configuration allows requests from `http://localhost:3000` during development.

## Next Steps

- Check out [DEVELOPMENT.md](DEVELOPMENT.md) for information on code style, linting, and PR processes.
- Check out [TESTING.md](TESTING.md) for instructions on running the test suites.
