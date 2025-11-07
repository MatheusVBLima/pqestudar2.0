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

    // Check admin status
    const { data: isAdminData, error: adminError } = await supabaseClient
      .rpc('is_admin')

    if (adminError || !isAdminData) {
      console.error('Admin check failed:', adminError)
      throw new Error('Forbidden: Admin access required')
    }

    // Parse request
    const { action, data } = await req.json()

    console.log(`Admin course action: ${action}`, { userId: user.id })

    let result

    switch (action) {
      case 'create': {
        const { data: course, error } = await supabaseClient
          .from('courses')
          .insert([{
            ...data,
            created_by: user.id,
            updated_by: user.id
          }])
          .select()
          .single()

        if (error) throw error
        result = course
        break
      }

      case 'update': {
        const { id, ...updates } = data
        const { data: course, error } = await supabaseClient
          .from('courses')
          .update({
            ...updates,
            updated_by: user.id
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        result = course
        break
      }

      case 'delete': {
        const { error } = await supabaseClient
          .from('courses')
          .delete()
          .eq('id', data.id)

        if (error) throw error
        result = { success: true }
        break
      }

      case 'hide': {
        const { error } = await supabaseClient
          .from('courses')
          .update({ 
            is_hidden: true,
            updated_by: user.id
          })
          .eq('id', data.id)

        if (error) throw error
        result = { success: true }
        break
      }

      case 'toggle': {
        const { error } = await supabaseClient
          .from('courses')
          .update({ 
            is_active: data.is_active,
            updated_by: user.id
          })
          .eq('id', data.id)

        if (error) throw error
        result = { success: true }
        break
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
    console.error('Admin courses error:', error)
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
