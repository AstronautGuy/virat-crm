<!-- generated-by: gsd-doc-writer -->

## Authentication

The API uses **Kinde Auth** for authentication. Requests must include a valid session token (managed by Kinde middleware) or a Bearer token if accessed externally.

Role-Based Access Control (RBAC) is enforced at the router level using tRPC middleware:

- `publicProcedure`: No authentication required.
- `protectedProcedure`: Requires a valid user session.
- `featureProtectedProcedure`: Requires a valid user session, enforces specific role checks (`admin`, `manager`, `employee`), and validates if the feature is toggled "ON" in the database by an administrator.

## Endpoints Overview

The primary API surface is exposed via **tRPC** (TypeScript Remote Procedure Call) at `/api/trpc`. A REST bridge is also available at `/api/rest` for the mobile client.

The following tRPC routers are available in `src/server/api/routers/`:

| Router          | Description                                                | Auth Required       |
| --------------- | ---------------------------------------------------------- | ------------------- |
| `analytics`     | Admin dashboards, sales performance, and data export.      | Yes (Admin/Manager) |
| `auth`          | User session and profile management.                       | Yes                 |
| `crm`           | Customer relationship management (leads, contacts).        | Yes                 |
| `dailyReports`  | End-of-day reports submission by employees.                | Yes                 |
| `heartbeat`     | Mobile app telemetry and 24/7 location ping handler.       | Yes                 |
| `hierarchy`     | Management of the employee reporting structure.            | Yes (Admin)         |
| `inventory`     | Stock management and branching.                            | Yes                 |
| `leaves`        | Employee leave requests and manager approvals.             | Yes                 |
| `location`      | Location tracking data and geofenced attendance endpoints. | Yes                 |
| `maintenance`   | System maintenance and admin toggles.                      | Yes (Admin)         |
| `notifications` | Web push notifications and in-app alerts.                  | Yes                 |
| `permissions`   | Role permissions and feature gating.                       | Yes (Admin)         |
| `replacements`  | Stock replacement and warranty claims.                     | Yes                 |
| `reports`       | Aggregated data reporting.                                 | Yes                 |
| `sales`         | Sales orders, tracking, and revenue.                       | Yes                 |
| `storage`       | Cloudflare R2 file upload/download presigned URLs.         | Yes                 |
| `users`         | User management and creation.                              | Yes (Admin)         |

## Request/Response Formats

Because this is a tRPC API, request and response formats are strongly typed using **Zod** schemas.

Example of a typical tRPC mutation payload:

```json
// POST /api/trpc/sales.create
{
  "json": {
    "customerId": 12,
    "amount": 5000,
    "status": "pending"
  }
}
```

Example response:

```json
{
  "result": {
    "data": {
      "json": {
        "id": 105,
        "success": true
      }
    }
  }
}
```

## Error Codes

tRPC maps standard errors to HTTP status codes. Common errors returned by the API:

- `BAD_REQUEST` (400): Invalid input (caught by Zod schema validation).
- `UNAUTHORIZED` (401): User is not logged in.
- `FORBIDDEN` (403): User lacks the required role or the feature is disabled.
- `NOT_FOUND` (404): The requested resource does not exist.
- `INTERNAL_SERVER_ERROR` (500): Unexpected database or server failure.

## Rate Limits

Currently, there is no application-level rate limiting middleware installed (like `upstash/ratelimit`). Rate limiting is handled at the infrastructure level (e.g., Vercel Edge Network or Cloudflare). <!-- VERIFY: Confirm if infrastructure rate limiting is active -->
