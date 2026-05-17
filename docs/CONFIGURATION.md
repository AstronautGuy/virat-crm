<!-- generated-by: gsd-doc-writer -->
## Environment Variables

The application relies on several environment variables for configuration. The canonical list is defined in `.env.example`.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | **Required** | `postgresql://postgres:password@localhost:5432/virat-crm` | Connection string for the PostgreSQL database used by Drizzle ORM. |
| `KINDE_CLIENT_ID` | **Required** | None | Kinde Auth application client ID. |
| `KINDE_CLIENT_SECRET` | **Required** | None | Kinde Auth application client secret. |
| `KINDE_ISSUER_URL` | **Required** | `https://auth.yourdomain.com` | Base URL of your Kinde Auth tenant. <!-- VERIFY: Actual production tenant URL --> |
| `KINDE_SITE_URL` | **Required** | `http://localhost:3000` | Base URL of the application. |
| `KINDE_POST_LOGOUT_REDIRECT_URL` | **Required** | `http://localhost:3000` | Where Kinde should redirect users after logout. |
| `KINDE_POST_LOGIN_REDIRECT_URL` | **Required** | `http://localhost:3000/dashboard` | Where Kinde should redirect users after login. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | **Required** | None | Public key for web push notifications (VAPID). |
| `VAPID_PRIVATE_KEY` | **Required** | None | Private key for web push notifications. |
| `R2_ACCOUNT_ID` | **Required** | None | Cloudflare account ID for R2 storage. |
| `R2_ACCESS_KEY_ID` | **Required** | None | Cloudflare R2 access key ID. |
| `R2_SECRET_ACCESS_KEY` | **Required** | None | Cloudflare R2 secret access key. |
| `R2_BUCKET_NAME` | **Required** | None | Cloudflare R2 bucket name for document storage. <!-- VERIFY: Actual production bucket name --> |

## Config File Format

Environment variables are validated on startup using `@t3-oss/env-nextjs` and `zod`. The validation schema is located at `src/env.js` (or similar file in `src/`).

## Per-environment Overrides

- **Local Development**: Create a `.env.local` or `.env` file in the project root to override the defaults provided in `.env.example`. This file should not be committed to version control.
- **Production**: Configure these variables directly within your hosting platform's environment settings (e.g., Vercel, Railway, or Docker).
