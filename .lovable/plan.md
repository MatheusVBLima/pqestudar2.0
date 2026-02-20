
## Root Cause: Storage RLS Policy — Missing `SELECT` Wrapper on `is_admin()`

### Diagnosis

The error `StorageApiError: new row violates row-level security policy` occurs because the storage policies for `vote-images` were written with a subtle but critical syntax difference from the working `tools-icons` policies:

```sql
-- ❌ vote-images (broken) — is_admin() returns null/false in storage context
WITH CHECK (bucket_id = 'vote-images' AND is_admin())

-- ✅ tools-icons (working) — subquery forces correct evaluation
WITH CHECK (bucket_id = 'tools-icons' AND (SELECT public.is_admin()))
```

In Supabase Storage, the `storage.objects` table evaluates RLS in a different security context than regular public tables. When `is_admin()` (a `SECURITY DEFINER` function) is called directly, `auth.uid()` is not properly propagated to the function, so it returns `false` for every user. Wrapping it in `(SELECT public.is_admin())` forces PostgreSQL to evaluate it as a correlated subquery, which correctly resolves the session's `auth.uid()`.

The same applies to `UPDATE` and `DELETE` policies (which also use the bare `is_admin()` call).

The URL preview "400 Failed to load resource" is a secondary issue — because the upload never completes, the `card_image_url` in the database is never set, so the card falls back to the gradient and the stored URL (if any) attempts to load from a non-existent path in storage.

---

### Plan

#### Step 1 — Database Migration: Fix Storage RLS Policies

Create a new migration that drops the broken policies and recreates them using the correct `(SELECT public.is_admin())` pattern, matching the `tools-icons` working implementation exactly.

```sql
-- Drop broken policies
DROP POLICY IF EXISTS "Admins can upload vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete vote images" ON storage.objects;

-- Recreate with the correct subquery pattern (matching tools-icons)
CREATE POLICY "Admins can upload vote images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );

CREATE POLICY "Admins can update vote images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );

CREATE POLICY "Admins can delete vote images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );
```

This is the **only backend change needed**. No other tables, RLS policies, or Edge Functions need to be modified.

#### Step 2 — Improve Upload Path (Defensive)

Currently the upload path is flat: `vote-{timestamp}-{random}.ext`. The `tools-icons` bucket organizes by item ID. While not strictly required for fixing the bug, changing the path to `{featureId}/{timestamp}-{random}.ext` makes it cleaner for cleanup.

However, since `ImageField` does not receive `featureId` at upload time (it's inside the form, before save), the current flat path is acceptable and will be kept as-is to minimize code changes.

#### Step 3 — No Frontend Changes Required

The `src/pages/Votacoes.tsx` upload logic is already correct:
- Uses `supabase.storage.from('vote-images').upload(...)` with `upsert: true` and `contentType: file.type`
- Uses `getPublicUrl()` to get the public URL
- `referrerPolicy="no-referrer"` is already in the card `<img>` tag
- `onError` fallback to gradient is already in place

Once the RLS policies are fixed, the upload will succeed and the URL will be saved to `card_image_url`, which will cause the card to render the image correctly.

---

### Files to Change

- **`supabase/migrations/[new].sql`** — New migration with fixed storage policies (DROP + CREATE)
- **`src/pages/Votacoes.tsx`** — No changes needed (upload logic is correct)

### What Will Work After the Fix

1. Admin uploads PNG/JPG/WEBP → file is stored in `vote-images` bucket → public URL is saved to `feature_requests.card_image_url` → card renders image as cover
2. Admin pastes a direct URL → saved to `card_image_url` → card renders it with `referrerPolicy="no-referrer"` and gradient fallback on error
3. No other pages or functionality is affected
