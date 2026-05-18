# Plan 1: Phase 5 - Secure Cloud Storage Implementation

Initialize Cloudflare R2 storage, database metadata tracking, and basic upload/download capabilities.

## Proposed Changes

### Database Layer

#### [NEW] [files.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/db/schema/files.ts)
- Create `files` table to track entity attachments.

### Backend Infrastructure

#### [NEW] [r2.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/lib/r2.ts)
- Initialize S3 Client with R2 credentials and endpoint.

#### [NEW] [storage.ts](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/server/api/routers/storage.ts)
- `getUploadUrl`: Generates a pre-signed PUT URL.
- `getFileUrl`: Generates a pre-signed GET URL (w/ RBAC).
- `recordUpload`: Saves metadata after successful upload.

### Frontend Integration

#### [NEW] [FileUploader.tsx](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/app/_components/ui/FileUploader.tsx)
- Reusable component for single/multiple file uploads.

#### [MODIFY] [sales/new/page.tsx](file:///c:/Users/TheAstronautGuy/WebstormProjects/virat-crm/src/app/sales/new/page.tsx)
- Add file upload field for invoices.

## Verification Plan

### Automated Tests
- Run `pnpm run check` for type safety.

### Manual Verification
1. **Upload**: Verify a file can be uploaded and its metadata appears in the DB.
2. **Security**: Ensure an Employee cannot generate a `getFileUrl` for a sale they don't own.
3. **View**: Confirm the pre-signed GET URL displays the document in the browser.
