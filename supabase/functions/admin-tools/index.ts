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
      throw new Error('Cabeçalho de autorização ausente');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar se é admin
    const { data: isAdminData, error: adminError } = await supabaseClient.rpc('is_admin');
    
    if (adminError || !isAdminData) {
      throw new Error('Acesso negado. Apenas administradores podem gerenciar ferramentas.');
    }

    const { action, data } = await req.json();
    console.log('[admin-tools] Action:', action, 'User:', user.id);

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
        const { name, description, url, icon_url, tags, is_visible } = data;

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
            tags: tags || [],
            is_visible: is_visible ?? true,
            sort_order: nextOrder,
            created_by: user.id,
            updated_by: user.id
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
    console.error('[admin-tools] Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('Acesso negado') ? 403 : 400,
      }
    );
  }
});
