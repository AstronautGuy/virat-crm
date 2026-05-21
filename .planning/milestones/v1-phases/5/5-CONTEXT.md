# Phase 5 Context: Secure Cloud Storage

## Background

Phase 5 introduces Cloudflare R2 for persistent, secure storage of ERP assets.

## Implementation Decisions

### 1. Provider & Protocol

- **Service**: Cloudflare R2.
- **Library**: `@aws-sdk/client-s3` (v3).
- **Endpoint**: Custom R2 endpoint provided by Cloudflare.

### 2. Storage Strategy

- **Upload Flow**:
  1. Client requests a pre-signed URL via tRPC.
  2. Server verifies RBAC and generates a short-lived (5min) S3 `PutObject` command.
  3. Client uploads directly to R2 using the URL.
  4. Client notifies server of successful upload to save the file metadata in the DB.
- **View Flow**:
  1. Client requests a file link.
  2. Server verifies hierarchy access and generates a 15-minute `GetObject` URL.

### 3. Database Schema

- New `files` table to track metadata:
  - `id`: UUID.
  - `entityType`: "Sale" | "Replacement".
  - `entityId`: Number.
  - `key`: S3 key.
  - `originalName`: string.
  - `mimeType`: string.
  - `size`: number.
  - `uploadedBy`: userId.

### 4. RBAC & Security

- No public buckets.
- All access (Read/Write) requires a valid tRPC session and hierarchy check.

### 5. UI Requirements

- Support multiple file uploads for replacements (photos).
- Single file upload for Sales (Invoice PDF/Image).
- Progress bars for uploads.
