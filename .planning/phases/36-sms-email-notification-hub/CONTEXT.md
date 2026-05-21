# Phase 36 Context: SMS & Email Notification Hub

## Objectives

- Integrate **Twilio SMS** for instant SMS low-stock notification triggers.
- Integrate **Resend** for premium HTML email inventory summaries and alerts.
- Adhere to strict multi-tenant branch isolation boundaries so alerts are routed only to authorized managers of the target branch.
- Standardize on safe fallback mock mechanisms if API environment keys are not configured.

## Constraints

- Do not introduce breaking changes to existing VAPID Web Push structures.
- Ensure type safety across both frontend/tRPC and backend services.
