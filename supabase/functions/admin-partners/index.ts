import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify user is admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check admin status directly from user_roles table using service role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError) {
      console.error('Role check error:', roleError)
      throw new Error('Forbidden: Admin access required')
    }

    if (!roleData) {
      console.error('User is not admin:', user.id)
      throw new Error('Forbidden: Admin access required')
    }

    // Parse request
    const { action, data } = await req.json()

    console.log(`Admin partner action: ${action}`, { userId: user.id })

    let result

    switch (action) {
      case 'list': {
        // Admin pode ver todos os parceiros (incluindo inativos)
        const { data: partners, error } = await supabaseClient
          .from('partners')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;
        result = partners;
        break;
      }

      case 'create': {
        const { data: partner, error } = await supabaseClient
          .from('partners')
          .insert([{
            ...data,
            created_by: user.id,
            updated_by: user.id
          }])
          .select()
          .single();

        if (error) throw error;
        result = partner;
        break;
      }

      case 'update': {
        const { id, ...updates } = data;
        const { data: partner, error } = await supabaseClient
          .from('partners')
          .update({
            ...updates,
            updated_by: user.id
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        result = partner;
        break;
      }

      case 'delete': {
        const { error } = await supabaseClient
          .from('partners')
          .delete()
          .eq('id', data.id);

        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'toggle': {
        const { error } = await supabaseClient
          .from('partners')
          .update({ 
            is_active: data.is_active,
            updated_by: user.id
          })
          .eq('id', data.id);

        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'reorder': {
        // Batch update sort_order for all partners
        const updates = data.partners.map((p: any, index: number) => ({
          id: p.id,
          sort_order: index,
          updated_by: user.id
        }));

        const results = await Promise.all(
          updates.map((u: any) =>
            supabaseClient
              .from('partners')
              .update({ sort_order: u.sort_order, updated_by: u.updated_by })
              .eq('id', u.id)
          )
        );

        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
          throw new Error(`Failed to update ${errors.length} partner(s)`);
        }

        result = { success: true };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Admin partners error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : 
                error.message.includes('Forbidden') ? 403 : 500
      }
    )
  }
})
