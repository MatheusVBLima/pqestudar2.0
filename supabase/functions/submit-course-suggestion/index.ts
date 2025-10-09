import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { suggestion, userId } = await req.json();

    // Validate input
    if (!suggestion || typeof suggestion !== 'string' || suggestion.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Sugestão inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (suggestion.trim().length > 500) {
      return new Response(
        JSON.stringify({ error: 'Sugestão muito longa (máximo 500 caracteres)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    if (userId) {
      // Rate limiting for authenticated users
      const { data: recentSuggestions, error: rateLimitError } = await supabase
        .from('course_suggestions')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo);

      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError);
        throw rateLimitError;
      }

      if (recentSuggestions && recentSuggestions.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'rate_limit',
            message: 'Você pode enviar apenas 1 sugestão por hora. Tente novamente mais tarde.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Rate limiting for anonymous users by IP
      // Get client IP from headers
      const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       'unknown';

      console.log('Checking rate limit for IP:', clientIP);

      // Check recent submissions from this IP
      const { data: recentSubmissions, error: ipCheckError } = await supabase
        .from('anonymous_course_suggestions_rate_limit')
        .select('id')
        .eq('ip_address', clientIP)
        .gte('created_at', oneHourAgo);

      if (ipCheckError) {
        console.error('IP rate limit check error:', ipCheckError);
        throw ipCheckError;
      }

      if (recentSubmissions && recentSubmissions.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'rate_limit',
            message: 'Você pode enviar apenas 1 sugestão por hora. Tente novamente mais tarde.' 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log this submission for rate limiting (without exposing IP to client)
      const { error: logError } = await supabase
        .from('anonymous_course_suggestions_rate_limit')
        .insert([{ ip_address: clientIP }]);

      if (logError) {
        console.error('Error logging anonymous submission:', logError);
        // Don't block the submission if logging fails
      }
    }

    // Insert the suggestion
    const { data, error } = await supabase
      .from('course_suggestions')
      .insert([{
        suggestion: suggestion.trim(),
        user_id: userId || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error inserting suggestion:', error);
      throw error;
    }

    console.log('Suggestion created successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Sugestão enviada com sucesso!' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-course-suggestion function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar sugestão',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
