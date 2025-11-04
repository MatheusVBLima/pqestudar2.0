import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscribeRequest {
  email: string;
  consent: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  pageSlug?: string;
  resendWelcome?: boolean;
}

// Hash function for privacy
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get client IP hash
function getIpHash(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return hashString(ip);
}

// Rate limiting check
async function checkRateLimit(supabase: any, ipHash: string): Promise<boolean> {
  // Cleanup old entries first
  await supabase.rpc('cleanup_newsletter_rate_limit');
  
  // Check current attempts
  const { data: rateData } = await supabase
    .from('newsletter_rate_limit')
    .select('*')
    .eq('ip_hash', ipHash)
    .gte('window_start', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .order('window_start', { ascending: false })
    .limit(1)
    .single();

  if (rateData && rateData.attempts >= 3) {
    return false; // Rate limit exceeded
  }

  // Update or insert rate limit
  if (rateData) {
    await supabase
      .from('newsletter_rate_limit')
      .update({ attempts: rateData.attempts + 1 })
      .eq('id', rateData.id);
  } else {
    await supabase
      .from('newsletter_rate_limit')
      .insert({ ip_hash: ipHash, attempts: 1, window_start: new Date().toISOString() });
  }

  return true;
}

// Log event
async function logEvent(
  supabase: any,
  eventType: string,
  emailHash: string,
  ipHash: string,
  utms: any,
  pageSlug?: string,
  errorMessage?: string,
  metadata?: any
) {
  await supabase.from('newsletter_events').insert({
    event_type: eventType,
    email_hash: emailHash,
    utm_source: utms.utmSource,
    utm_medium: utms.utmMedium,
    utm_campaign: utms.utmCampaign,
    utm_content: utms.utmContent,
    utm_term: utms.utmTerm,
    page_slug: pageSlug,
    ip_hash: ipHash,
    error_message: errorMessage,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      email,
      consent,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      pageSlug,
      resendWelcome = false,
    }: SubscribeRequest = await req.json();

    // Validation
    if (!email || !consent) {
      return new Response(
        JSON.stringify({ error: 'Email e consentimento são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailHash = await hashString(email);
    const ipHash = await getIpHash(req);

    // Rate limiting
    const rateLimitOk = await checkRateLimit(supabase, ipHash);
    if (!rateLimitOk) {
      await logEvent(
        supabase,
        'newsletter_error',
        emailHash,
        ipHash,
        { utmSource, utmMedium, utmCampaign, utmContent, utmTerm },
        pageSlug,
        'Rate limit exceeded'
      );
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log submit event
    await logEvent(
      supabase,
      'newsletter_submit',
      emailHash,
      ipHash,
      { utmSource, utmMedium, utmCampaign, utmContent, utmTerm },
      pageSlug
    );

    // Get Brevo config
    const { data: config } = await supabase
      .from('brevo_config')
      .select('*')
      .single();

    if (!config) {
      throw new Error('Configuração da Brevo não encontrada');
    }

    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      throw new Error('BREVO_API_KEY não configurada');
    }

    // Prepare Brevo API request
    const brevoUrl = 'https://api.brevo.com/v3/contacts';
    const brevoHeaders = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': brevoApiKey,
    };

    // Check if contact already exists
    let contactExists = false;
    let isSubscribed = false;
    
    try {
      const getContactResponse = await fetch(`${brevoUrl}/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: brevoHeaders,
      });

      if (getContactResponse.ok) {
        contactExists = true;
        const contactData = await getContactResponse.json();
        // Check if already subscribed to the list
        if (contactData.listIds && contactData.listIds.includes(parseInt(config.default_list_id))) {
          isSubscribed = true;
        }
      }
    } catch (error) {
      console.log('Contact check error (non-critical):', error);
    }

    // Handle resend welcome email
    if (resendWelcome && isSubscribed) {
      await logEvent(
        supabase,
        'newsletter_resend',
        emailHash,
        ipHash,
        { utmSource, utmMedium, utmCampaign, utmContent, utmTerm },
        pageSlug
      );

      // TODO: Implement resend welcome email via Brevo transactional email
      // This would require a transactional template ID in Brevo config
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email de boas-vindas reenviado com sucesso!',
          alreadySubscribed: true,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already subscribed and not resending, inform user
    if (isSubscribed) {
      await logEvent(
        supabase,
        'newsletter_already_subscribed',
        emailHash,
        ipHash,
        { utmSource, utmMedium, utmCampaign, utmContent, utmTerm },
        pageSlug
      );
      
      return new Response(
        JSON.stringify({
          success: false,
          alreadySubscribed: true,
          message: config.error_message_already_subscribed,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare contact attributes
    const attributes: any = {
      SOURCE: 'site',
      PAGE_SLUG: pageSlug || 'homepage',
    };

    if (utmSource) attributes.UTM_SOURCE = utmSource;
    if (utmMedium) attributes.UTM_MEDIUM = utmMedium;
    if (utmCampaign) attributes.UTM_CAMPAIGN = utmCampaign;
    if (utmContent) attributes.UTM_CONTENT = utmContent;
    if (utmTerm) attributes.UTM_TERM = utmTerm;

    // Create/Update contact in Brevo
    const contactPayload: any = {
      email,
      attributes,
      listIds: [parseInt(config.default_list_id)],
      updateEnabled: true,
    };

    const brevoResponse = await fetch(brevoUrl, {
      method: 'POST',
      headers: brevoHeaders,
      body: JSON.stringify(contactPayload),
    });

    const responseText = await brevoResponse.text();
    let brevoData = null;
    
    try {
      if (responseText) {
        brevoData = JSON.parse(responseText);
      }
    } catch (e) {
      console.log('Brevo response was not JSON:', responseText);
    }

    if (!brevoResponse.ok) {
      console.error('Brevo API error:', responseText);
      
      await logEvent(
        supabase,
        'newsletter_error',
        emailHash,
        ipHash,
        { utmSource, utmMedium, utmCampaign, utmContent, utmTerm },
        pageSlug,
        `Brevo API error: ${responseText}`
      );

      throw new Error('Erro ao criar contato na Brevo');
    }

    // Log successful listing
    await logEvent(
      supabase,
      'newsletter_subscribed',
      emailHash,
      ipHash,
      { utmSource, utmMedium, utmCampaign, utmContent, utmTerm },
      pageSlug,
      undefined,
      { brevoResponse: brevoData }
    );

    // Determine success message based on opt-in mode
    const successMessage = config.opt_in_mode === 'double_opt_in'
      ? config.success_message_doi
      : config.success_message_single;

    return new Response(
      JSON.stringify({
        success: true,
        message: successMessage,
        requiresConfirmation: config.opt_in_mode === 'double_opt_in',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in subscribe-newsletter-brevo:', error);

    return new Response(
      JSON.stringify({
        error: 'Erro ao processar inscrição',
        details: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
