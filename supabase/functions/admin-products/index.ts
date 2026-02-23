import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'unauthorized', message: 'Cabeçalho de autorização ausente' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'unauthorized', message: 'Usuário não autenticado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Admin check via user_roles
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.log('[admin-products] Access denied for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'not_admin', message: 'Acesso negado. Apenas administradores podem gerenciar produtos.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const { action, data } = await req.json();
    const traceId = crypto.randomUUID().slice(0, 8);
    console.log('[admin-products]', { action, userId: user.id, traceId });

    switch (action) {
      case 'list': {
        const { data: products, error } = await supabaseClient
          .from('products')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(products), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
        });
      }

      case 'create': {
        const { title, description, category, cta_url, image_url, sort_order } = data;

        if (!title || !description || !category || !cta_url) {
          return new Response(
            JSON.stringify({ error: 'validation', message: 'Título, descrição, categoria e URL do CTA são obrigatórios.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const { data: lastProduct } = await supabaseClient
          .from('products')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1)
          .single();

        const nextOrder = sort_order ?? ((lastProduct?.sort_order ?? 0) + 1);

        const { data: newProduct, error } = await supabaseClient
          .from('products')
          .insert([{ title, description, category, cta_url, image_url: image_url || null, sort_order: nextOrder }])
          .select()
          .single();

        if (error) throw error;

        console.log('[admin-products] Created:', newProduct.id, traceId);
        return new Response(JSON.stringify(newProduct), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201,
        });
      }

      case 'update': {
        const { id, ...updates } = data;
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'validation', message: 'ID do produto é obrigatório.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const { data: updated, error } = await supabaseClient
          .from('products')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        console.log('[admin-products] Updated:', id, traceId);
        return new Response(JSON.stringify(updated), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
        });
      }

      case 'toggleActive': {
        const { id, is_active } = data;

        const { data: toggled, error } = await supabaseClient
          .from('products')
          .update({ is_active, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        console.log('[admin-products] Toggled active:', id, is_active, traceId);
        return new Response(JSON.stringify(toggled), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
        });
      }

      case 'delete': {
        const { id } = data;
        const { error } = await supabaseClient.from('products').delete().eq('id', id);

        if (error) throw error;

        console.log('[admin-products] Deleted:', id, traceId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: 'unknown_action', message: `Ação desconhecida: ${action}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    const traceId = crypto.randomUUID();
    console.error('[admin-products] Error', { traceId, error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ error: 'internal', message: error.message || 'Erro interno do servidor', traceId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
