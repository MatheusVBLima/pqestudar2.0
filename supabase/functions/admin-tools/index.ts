import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'unauthorized',
          message: 'Cabeçalho de autorização ausente'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          error: 'unauthorized',
          message: 'Usuário não autenticado'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Check admin status directly from user_roles table using service role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.log('[admin-tools] Access denied for user:', user.id);
      return new Response(
        JSON.stringify({ 
          error: 'not_admin',
          message: 'Acesso negado. Apenas administradores podem gerenciar ferramentas.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    const { action, data } = await req.json();
    console.log('[admin-tools]', {
      action,
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    switch (action) {
      case 'list': {
        const { data: tools, error } = await supabaseClient
          .from('tools')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;

        return new Response(JSON.stringify(tools), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case 'create': {
        const {
          name,
          description,
          url,
          icon_url,
          attachment_url,
          tags,
          is_visible,
          is_featured,
          featured_indefinite,
          featured_start,
          featured_end,
          slug,
          // legacy editorial (kept for compat)
          what_is,
          who_for,
          how_helps,
          pros,
          cons,
          extra_markdown,
          // seo
          seo_title,
          seo_description,
          // new editorial (guide-style)
          content_markdown,
          cover_image_url,
          cta_top_label, cta_top_url, cta_top_text,
          cta_middle_label, cta_middle_url, cta_middle_text,
          cta_final_label, cta_final_url, cta_final_text,
          internal_links,
        } = data;

        // Validar campos obrigatórios
        if (!name || !description) {
          return new Response(
            JSON.stringify({
              error: 'validation',
              message: 'Nome e descrição são obrigatórios',
              details: {
                name: !name ? 'Nome é obrigatório' : undefined,
                description: !description ? 'Descrição é obrigatória' : undefined,
              },
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }

        // Obter próxima posição
        const { data: lastTool } = await supabaseClient
          .from('tools')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1)
          .single();

        const nextOrder = (lastTool?.sort_order ?? -1) + 1;

        const { data: newTool, error } = await supabaseClient
          .from('tools')
          .insert([{
            name,
            description,
            url,
            icon_url,
            attachment_url,
            tags: tags || [],
            is_visible: is_visible ?? true,
            is_featured: is_featured ?? false,
            featured_indefinite: featured_indefinite ?? false,
            featured_start: featured_start ?? null,
            featured_end: featured_end ?? null,
            slug: slug || null,
            // legacy editorial (kept for compat)
            what_is: what_is ?? null,
            who_for: who_for ?? null,
            how_helps: how_helps ?? null,
            pros: pros ?? null,
            cons: cons ?? null,
            extra_markdown: extra_markdown ?? null,
            // seo
            seo_title: seo_title ?? null,
            seo_description: seo_description ?? null,
            // new editorial (guide-style)
            content_markdown: content_markdown ?? '',
            cover_image_url: cover_image_url ?? null,
            cta_top_label: cta_top_label ?? null,
            cta_top_url: cta_top_url ?? null,
            cta_top_text: cta_top_text ?? null,
            cta_middle_label: cta_middle_label ?? null,
            cta_middle_url: cta_middle_url ?? null,
            cta_middle_text: cta_middle_text ?? null,
            cta_final_label: cta_final_label ?? null,
            cta_final_url: cta_final_url ?? null,
            cta_final_text: cta_final_text ?? null,
            internal_links: internal_links ?? [],
            sort_order: nextOrder,
            created_by: user.id,
            updated_by: user.id,
          }])
          .select()
          .single();

        if (error) throw error;

        console.log('[admin-tools] Created tool:', newTool.id);

        return new Response(JSON.stringify(newTool), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }

      case 'update': {
        const { id, ...updates } = data;

        if (!id) {
          return new Response(
            JSON.stringify({ 
              error: 'validation',
              message: 'ID da ferramenta é obrigatório',
              details: { id: 'ID é obrigatório' }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }

        const { data: updatedTool, error } = await supabaseClient
          .from('tools')
          .update({
            ...updates,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        console.log('[admin-tools] Updated tool:', id);

        return new Response(JSON.stringify(updatedTool), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case 'delete': {
        const { id } = data;

        const { error } = await supabaseClient
          .from('tools')
          .delete()
          .eq('id', id);

        if (error) throw error;

        console.log('[admin-tools] Deleted tool:', id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case 'reorder': {
        const { tools } = data;

        // Atualizar ordem de cada ferramenta
        const updates = tools.map((tool: { id: string; sort_order: number }) =>
          supabaseClient
            .from('tools')
            .update({ 
              sort_order: tool.sort_order,
              updated_by: user.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', tool.id)
        );

        await Promise.all(updates);

        console.log('[admin-tools] Reordered', tools.length, 'tools');

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }
  } catch (error) {
    const traceId = crypto.randomUUID();
    console.error('[admin-tools] Error', { 
      traceId,
      error: error.message,
      stack: error.stack 
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'internal',
        message: error.message || 'Erro interno do servidor',
        traceId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
