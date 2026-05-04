import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ─── URL → entity resolver (server-side mirror) ───
const PAGE_SETTINGS_ROUTES = [
  '/', '/ferramentas', '/concursos', '/votacoes', '/produtos',
  '/privacidade', '/termos', '/ferramentas/salvos', '/premium',
  '/sobre-pqestudar',
];

interface Resolved {
  entityType: string;
  entityId: string; // route or slug
  profileKey: string;
}

type SupabaseAdminClient = ReturnType<typeof createClient>;
type FieldRecord = Record<string, string | number | null | undefined>;

interface SaveBody {
  path?: string;
  entity_type?: string;
  entity_id?: string;
  profile_key?: string;
  field_data?: Record<string, string>;
  source?: string;
  audit_score_before?: number | null;
  db_id?: string;
}

interface RollbackBody {
  version_id?: string;
  path?: string;
}

function getErrorMessage(error: unknown, fallback = 'Internal error') {
  return error instanceof Error ? error.message : fallback;
}

function resolveUrl(path: string): Resolved | null {
  const clean = path.split('?')[0].replace(/\/$/, '') || '/';
  if (PAGE_SETTINGS_ROUTES.includes(clean)) {
    return { entityType: 'page_settings', entityId: clean, profileKey: 'page_settings' };
  }
  const m = clean.match(/^\/concursos\/([a-z0-9-]+)$/);
  if (m) return { entityType: 'oportunidade', entityId: m[1], profileKey: 'oportunidade' };
  return null;
}

// ─── Field mappings per entity type ───
const FIELD_KEYS: Record<string, string[]> = {
  page_settings: ['title_tag', 'meta_description', 'header_title', 'header_description'],
  oportunidade: ['titulo', 'meta_title', 'meta_description', 'resumo_editorial'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  );

  // Auth check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, 401);

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { auth: { persistSession: false }, global: { headers: { Authorization: authHeader } } },
  );
  const { data: isAdmin } = await userClient.rpc('is_admin');
  if (isAdmin !== true) return json({ error: 'Forbidden' }, 403);

  // Get user id
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  const userId = user?.id;

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // ═══ GET: load current fields ═══
    if (req.method === 'GET' && action === 'load') {
      const path = url.searchParams.get('path');
      if (!path) return json({ error: 'Missing path parameter' }, 400);

      const resolved = resolveUrl(path);
      if (!resolved) return json({ error: 'URL not supported for editing', supported: false }, 200);

      const fields = await loadFields(supabaseAdmin, resolved);
      if (!fields) return json({ error: 'Entity not found' }, 404);

      return json({
        supported: true,
        entityType: resolved.entityType,
        entityId: resolved.entityId,
        profileKey: resolved.profileKey,
        fields,
        updatedAt: fields._updated_at,
      });
    }

    // ═══ GET: version history ═══
    if (req.method === 'GET' && action === 'history') {
      const path = url.searchParams.get('path');
      if (!path) return json({ error: 'Missing path parameter' }, 400);

      const { data, error } = await supabaseAdmin
        .from('content_versions')
        .select('*')
        .eq('url', path)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return json({ versions: data ?? [] });
    }

    // ═══ POST: save or rollback ═══
    if (req.method === 'POST') {
      const body = await req.json();
      const { action: bodyAction } = body;

      if (bodyAction === 'save') {
        return await handleSave(supabaseAdmin, body, userId);
      }

      if (bodyAction === 'rollback') {
        return await handleRollback(supabaseAdmin, body, userId);
      }

      if (bodyAction === 'update_score') {
        // Update audit_score_after on a version
        const { version_id, score_after } = body;
        if (!version_id) return json({ error: 'Missing version_id' }, 400);

        const { error } = await supabaseAdmin
          .from('content_versions')
          .update({ audit_score_after: score_after })
          .eq('id', version_id);

        if (error) throw error;
        return json({ success: true });
      }

      return json({ error: 'Unknown action' }, 400);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err: unknown) {
    console.error('admin-content-versions error:', err);
    return json({ error: getErrorMessage(err) }, 500);
  }
});

// ─── Load fields from source table ───
async function loadFields(admin: SupabaseAdminClient, resolved: Resolved): Promise<FieldRecord | null> {
  const keys = FIELD_KEYS[resolved.entityType];
  if (!keys) return null;

  if (resolved.entityType === 'page_settings') {
    const { data, error } = await admin
      .from('page_settings')
      .select('*')
      .eq('route', resolved.entityId)
      .maybeSingle();
    if (error || !data) return null;
    const result: FieldRecord = { _updated_at: data.updated_at };
    for (const k of keys) result[k] = data[k] ?? '';
    return result;
  }

  if (resolved.entityType === 'oportunidade') {
    const { data, error } = await admin
      .from('oportunidades')
      .select('id, titulo, meta_title, meta_description, resumo_editorial, updated_at')
      .eq('slug', resolved.entityId)
      .maybeSingle();
    if (error || !data) return null;
    const result: FieldRecord = { _updated_at: data.updated_at, _db_id: data.id };
    for (const k of keys) result[k] = data[k] ?? '';
    return result;
  }

  return null;
}

// ─── Write fields to source table ───
async function writeFields(admin: SupabaseAdminClient, resolved: Resolved, fieldData: Record<string, string>, dbId?: string): Promise<void> {
  const keys = FIELD_KEYS[resolved.entityType];
  if (!keys) throw new Error('Unknown entity type');

  const updatePayload: Record<string, string> = {};
  for (const k of keys) {
    if (k in fieldData) updatePayload[k] = fieldData[k];
  }

  if (Object.keys(updatePayload).length === 0) throw new Error('No fields to update');

  if (resolved.entityType === 'page_settings') {
    const { error } = await admin
      .from('page_settings')
      .update(updatePayload)
      .eq('route', resolved.entityId);
    if (error) throw error;
  } else if (resolved.entityType === 'oportunidade') {
    // Use the actual DB id for oportunidades
    const id = dbId || resolved.entityId;
    const { error } = await admin
      .from('oportunidades')
      .update(updatePayload)
      .eq(dbId ? 'id' : 'slug', id);
    if (error) throw error;
  }
}

// ─── Handle save ───
async function handleSave(admin: SupabaseAdminClient, body: SaveBody, userId?: string) {
  const { path, entity_type, entity_id, profile_key, field_data, source, audit_score_before, db_id } = body;
  if (!path || !entity_type || !entity_id || !profile_key || !field_data) {
    return json({ error: 'Missing required fields' }, 400);
  }

  const resolved = resolveUrl(path);
  if (!resolved) return json({ error: 'URL not supported' }, 400);

  // Get latest version for previous_version_id
  const { data: latestVersions } = await admin
    .from('content_versions')
    .select('id')
    .eq('url', path)
    .order('created_at', { ascending: false })
    .limit(1);

  const previousVersionId = latestVersions?.[0]?.id ?? null;

  // Build summary
  const changedKeys = Object.keys(field_data);
  const summary = `Alterou: ${changedKeys.join(', ')}`;

  // Write to source table
  await writeFields(admin, resolved, field_data, db_id);

  // Create version record
  const { data: version, error } = await admin
    .from('content_versions')
    .insert({
      url: path,
      entity_type,
      entity_id,
      profile_key,
      field_data,
      source: source || 'copy_audit',
      summary,
      created_by: userId,
      previous_version_id: previousVersionId,
      audit_score_before: audit_score_before ?? null,
    })
    .select('id')
    .single();

  if (error) throw error;

  return json({ success: true, version_id: version.id, summary });
}

// ─── Handle rollback ───
async function handleRollback(admin: SupabaseAdminClient, body: RollbackBody, userId?: string) {
  const { version_id, path } = body;
  if (!version_id || !path) return json({ error: 'Missing version_id or path' }, 400);

  // Load the target version
  const { data: targetVersion, error: vErr } = await admin
    .from('content_versions')
    .select('*')
    .eq('id', version_id)
    .single();

  if (vErr || !targetVersion) return json({ error: 'Version not found' }, 404);

  const resolved = resolveUrl(path);
  if (!resolved) return json({ error: 'URL not supported' }, 400);

  // Apply the old field_data to source
  await writeFields(admin, resolved, targetVersion.field_data, targetVersion.field_data._db_id);

  // Get latest version id
  const { data: latestVersions } = await admin
    .from('content_versions')
    .select('id')
    .eq('url', path)
    .order('created_at', { ascending: false })
    .limit(1);

  const previousVersionId = latestVersions?.[0]?.id ?? null;

  // Create new rollback version
  const { data: newVersion, error: insertErr } = await admin
    .from('content_versions')
    .insert({
      url: path,
      entity_type: targetVersion.entity_type,
      entity_id: targetVersion.entity_id,
      profile_key: targetVersion.profile_key,
      field_data: targetVersion.field_data,
      source: 'rollback',
      summary: `Rollback para versão de ${targetVersion.created_at}`,
      created_by: userId,
      previous_version_id: previousVersionId,
    })
    .select('id')
    .single();

  if (insertErr) throw insertErr;

  return json({ success: true, version_id: newVersion.id });
}
