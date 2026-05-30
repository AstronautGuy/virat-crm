---
focus: tech
last_mapped_commit: HEAD
date: 2026-05-29
---

# INTEGRATIONS.md

## External Services & APIs
- **AWS S3**: Uses `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` for file storage.
- **Email**: Resend (`resend`) for transactional emails.
- **SMS**: Twilio (`twilio`) for SMS notifications.
- **Database**: PostgreSQL (via `postgres` driver) hosted externally.
- **Web Push**: `web-push` for PWA push notifications.

## Internal APIs
- **tRPC**: API endpoints exposed at `/api/trpc/*` for frontend-backend communication.
