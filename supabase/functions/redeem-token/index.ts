import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Autorização necessária. Faça login primeiro.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { token } = await req.json();
    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Token não fornecido ou inválido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      return new Response(
        JSON.stringify({ error: 'Token não pode ser vazio.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Client for getting the user
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado. Faça login primeiro.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} attempting to redeem token: ${trimmedToken.substring(0, 8)}...`);

    // Fetch the token from database (using service role)
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('redeem_tokens')
      .select('*')
      .eq('token', trimmedToken)
      .single();

    if (tokenError || !tokenData) {
      console.log('Token not found:', trimmedToken.substring(0, 8));
      return new Response(
        JSON.stringify({ error: 'Token inválido ou não encontrado.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check token status
    if (tokenData.status === 'used') {
      return new Response(
        JSON.stringify({ error: 'Este token já foi utilizado.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tokenData.status === 'expired') {
      return new Response(
        JSON.stringify({ error: 'Este token expirou.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tokenData.status === 'revoked') {
      return new Response(
        JSON.stringify({ error: 'Este token foi revogado.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tokenData.status !== 'new') {
      return new Response(
        JSON.stringify({ error: 'Token em estado inválido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiration
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    if (expiresAt < now) {
      // Mark as expired
      await supabaseAdmin
        .from('redeem_tokens')
        .update({ status: 'expired' })
        .eq('id', tokenData.id);

      return new Response(
        JSON.stringify({ error: 'Este token expirou.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Helper function to add plan duration
    // Using simple day-based calculation: monthly = +30d, annual = +365d, trial_30d = +30d
    const addPlanDuration = (baseDate: Date, planType: string): Date => {
      const result = new Date(baseDate);
      switch (planType) {
        case 'monthly':
          result.setDate(result.getDate() + 30);
          break;
        case 'annual':
          result.setDate(result.getDate() + 365);
          break;
        case 'trial_30d':
          result.setDate(result.getDate() + 30);
          break;
        default:
          throw new Error('Invalid plan type');
      }
      return result;
    };

    // Validate plan type
    if (!['monthly', 'annual', 'trial_30d'].includes(tokenData.plan_type)) {
      return new Response(
        JSON.stringify({ error: 'Tipo de plano inválido no token.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start transaction-like operations
    // 1. Mark token as used
    const { error: updateTokenError } = await supabaseAdmin
      .from('redeem_tokens')
      .update({
        status: 'used',
        used_at: startsAt.toISOString(),
        used_by_user_id: user.id,
      })
      .eq('id', tokenData.id)
      .eq('status', 'new'); // Ensure still 'new' to prevent race conditions

    if (updateTokenError) {
      console.error('Error updating token:', updateTokenError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar o token. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check if user already has a subscription
    const { data: existingSub, error: subCheckError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, ends_at, status, starts_at')
      .eq('user_id', user.id)
      .single();

    if (subCheckError && subCheckError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      console.error('Error checking subscription:', subCheckError);
    }

    if (existingSub) {
      // Update existing subscription
      const currentEndsAt = new Date(existingSub.ends_at);
      const isActiveAndNotExpired = existingSub.status === 'active' && currentEndsAt > now;
      
      let newStartsAt: string;
      let newEndsAt: Date;
      
      if (isActiveAndNotExpired) {
        // Keep the original starts_at, extend ends_at from current end date
        newStartsAt = existingSub.starts_at;
        newEndsAt = addPlanDuration(currentEndsAt, tokenData.plan_type);
      } else {
        // Subscription is expired/inactive - start fresh from now
        newStartsAt = now.toISOString();
        newEndsAt = addPlanDuration(now, tokenData.plan_type);
      }

      const { error: updateSubError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          plan_type: tokenData.plan_type,
          starts_at: newStartsAt,
          ends_at: newEndsAt.toISOString(),
        })
        .eq('id', existingSub.id);

      if (updateSubError) {
        console.error('Error updating subscription:', updateSubError);
        // Try to rollback token
        await supabaseAdmin
          .from('redeem_tokens')
          .update({ status: 'new', used_at: null, used_by_user_id: null })
          .eq('id', tokenData.id);

        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar assinatura. Tente novamente.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Updated subscription for user ${user.id}, starts_at=${newStartsAt}, ends_at=${newEndsAt.toISOString()}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Assinatura ativada com sucesso!',
          subscription: {
            plan_type: tokenData.plan_type,
            starts_at: newStartsAt,
            ends_at: newEndsAt.toISOString(),
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Create new subscription - start from now
      const newStartsAt = now.toISOString();
      const newEndsAt = addPlanDuration(now, tokenData.plan_type);

      const { error: createSubError } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: user.id,
          status: 'active',
          plan_type: tokenData.plan_type,
          starts_at: newStartsAt,
          ends_at: newEndsAt.toISOString(),
        });

      if (createSubError) {
        console.error('Error creating subscription:', createSubError);
        // Try to rollback token
        await supabaseAdmin
          .from('redeem_tokens')
          .update({ status: 'new', used_at: null, used_by_user_id: null })
          .eq('id', tokenData.id);

        return new Response(
          JSON.stringify({ error: 'Erro ao criar assinatura. Tente novamente.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Created subscription for user ${user.id}, starts_at=${newStartsAt}, ends_at=${newEndsAt.toISOString()}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Assinatura ativada com sucesso!',
          subscription: {
            plan_type: tokenData.plan_type,
            starts_at: newStartsAt,
            ends_at: newEndsAt.toISOString(),
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro inesperado. Tente novamente.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
