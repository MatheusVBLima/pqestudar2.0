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

    console.log(`Admin course action: ${action}`, { userId: user.id })

    let result

    switch (action) {
      case 'create': {
        // Normalize and validate data
        const normalizedData = {
          title: data.title?.trim(),
          description: data.description?.trim() || '',
          category: data.category?.toLowerCase(),
          duration: typeof data.duration === 'string' 
            ? data.duration.replace(/[^\d]/g, '') || '0'
            : String(data.duration || '0'),
          price: data.price || 'Consultar',
          image_url: data.image_url,
          institution: data.institution || 'Plataforma Parceira',
          level: data.level?.toLowerCase() || 'iniciante',
          badge: data.badge || null,
          affiliate_link: data.affiliate_link,
          created_by: user.id,
          updated_by: user.id
        }

        // Validate required fields
        if (!normalizedData.title) {
          throw new Error('Título é obrigatório')
        }

        const { data: course, error } = await supabaseClient
          .from('courses')
          .insert([normalizedData])
          .select()
          .single()

        if (error) throw error
        result = course
        break
      }

      case 'update': {
        const { id, ...updates } = data
        
        // Normalize updates
        const normalizedUpdates: Record<string, unknown> = { updated_by: user.id }
        
        if (updates.title !== undefined) normalizedUpdates.title = updates.title?.trim()
        if (updates.description !== undefined) normalizedUpdates.description = updates.description?.trim()
        if (updates.category !== undefined) normalizedUpdates.category = updates.category?.toLowerCase()
        if (updates.duration !== undefined) {
          normalizedUpdates.duration = typeof updates.duration === 'string'
            ? updates.duration.replace(/[^\d]/g, '') || '0'
            : String(updates.duration || '0')
        }
        if (updates.level !== undefined) normalizedUpdates.level = updates.level?.toLowerCase()
        if (updates.price !== undefined) normalizedUpdates.price = updates.price
        if (updates.image_url !== undefined) normalizedUpdates.image_url = updates.image_url
        if (updates.institution !== undefined) normalizedUpdates.institution = updates.institution
        if (updates.badge !== undefined) normalizedUpdates.badge = updates.badge
        if (updates.affiliate_link !== undefined) normalizedUpdates.affiliate_link = updates.affiliate_link
        if (updates.is_active !== undefined) normalizedUpdates.is_active = updates.is_active

        const { data: course, error } = await supabaseClient
          .from('courses')
          .update(normalizedUpdates)
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
    
    // Determine appropriate status code
    let status = 500
    if (error.message === 'Unauthorized' || error.message === 'No authorization header') {
      status = 401
    } else if (error.message.includes('Forbidden') || error.message.includes('Admin access required')) {
      status = 403
    } else if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
      status = 400
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status
      }
    )
  }
})
