# Milestone 4: Advanced Access Control & UX Refinement

## Phase 15: Dynamic Role-Based Access Control
- `[x]` Create `rolePermissions` table in schema
- `[x]` Implement `permissions` tRPC router
- `[x]` Develop Admin UI at `/admin/feature-access`
- `[x]` Refactor `DesktopSidebar` to use dynamic permissions
- `[/]` Verify role-based toggling (Manager/Admin/User)
- `[ ]` Phase 15 Summary & Audit

## Phase 16: Granular Feature Gating
- [ ] Implement `featureProtectedProcedure` in tRPC
- [ ] Create `FeatureGate` component for page-level blocking
- [ ] Wrap sensitive routes (Maps, Reports, etc.) with `FeatureGate`
- [ ] Apply `featureProtectedProcedure` to existing routers
- [ ] Verify hard-blocking for disabled features
- [ ] Phase 16 Summary & Audit
