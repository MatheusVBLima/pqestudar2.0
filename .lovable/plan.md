

## Plan: Add `/sobre-pqestudar` to audit system

The route is missing from three places that control which URLs get audited and which are editable via the optimization center.

### Changes

1. **`src/lib/iframe-audit-engine.ts`** (line 30): Add `/sobre-pqestudar` to `STATIC_PATHS` array so the audit engine includes it when building URLs to scan.

2. **`src/lib/audit-url-resolver.ts`** (lines 13-22): Add `/sobre-pqestudar` to `PAGE_SETTINGS_ROUTES` so audit findings for this route are recognized as editable (maps to `page_settings` entity type).

3. **`supabase/functions/admin-content-versions/index.ts`** (lines 19-21): Add `/sobre-pqestudar` to the server-side `PAGE_SETTINGS_ROUTES` mirror so the content versioning/optimization drawer works for this route.

No database changes needed — the `page_settings` row for `/sobre-pqestudar` was already inserted in a previous migration.

