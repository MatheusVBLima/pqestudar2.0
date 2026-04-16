import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// CORS allowlist — apenas origens oficiais
const ALLOWED_ORIGINS = [
  'https://pqestudar.com.br',
  'https://www.pqestudar.com.br',
  'https://pqestudar-prototipo.lovable.app',
];
// Padrão de previews Lovable (id-preview--<id>.lovable.app e <id>.lovable.app)
const LOVABLE_PREVIEW_REGEX = /^https:\/\/([a-z0-9-]+\.)?lovable\.app$/i;

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && (
    ALLOWED_ORIGINS.includes(origin) || LOVABLE_PREVIEW_REGEX.test(origin)
  );
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

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
  // Honeypot — deve vir vazio. Bots tendem a preencher.
  website?: string;
}

// Validação de e-mail server-side
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LEN = 255;
function isValidEmail(email: unknown): email is string {
  return typeof email === 'string'
    && email.length > 0
    && email.length <= MAX_EMAIL_LEN
    && EMAIL_REGEX.test(email);
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
function getIpHash(req: Request): Promise<string> {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';
  return hashString(ip);
}

// Rate limiting reforçado: 5 tentativas / 15 min + cap diário de 20
const SHORT_WINDOW_MIN = 15;
const SHORT_WINDOW_MAX = 5;
const DAILY_CAP = 20;

async function checkRateLimit(supabase: any, ipHash: string): Promise<{ ok: boolean; reason?: string }> {
  await supabase.rpc('cleanup_newsletter_rate_limit_30d').catch(() => {
    // fallback caso a função 30d não exista
    return supabase.rpc('cleanup_newsletter_rate_limit');
  });

  const shortWindowStart = new Date(Date.now() - SHORT_WINDOW_MIN * 60 * 1000).toISOString();
  const dayWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Janela curta
  const { data: shortData } = await supabase
    .from('newsletter_rate_limit')
    .select('id, attempts, window_start')
    .eq('ip_hash', ipHash)
    .gte('window_start', shortWindowStart)
    .order('window_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (shortData && shortData.attempts >= SHORT_WINDOW_MAX) {
    return { ok: false, reason: 'short_window' };
  }

  // Cap diário (soma de tentativas nas últimas 24h)
  const { data: dayRows } = await supabase
    .from('newsletter_rate_limit')
    .select('attempts')
    .eq('ip_hash', ipHash)
    .gte('window_start', dayWindowStart);

  const dailyTotal = (dayRows ?? []).reduce((sum: number, r: any) => sum + (r.attempts || 0), 0);
  if (dailyTotal >= DAILY_CAP) {
    return { ok: false, reason: 'daily_cap' };
  }

  if (shortData) {
    await supabase
      .from('newsletter_rate_limit')
      .update({ attempts: shortData.attempts + 1 })
      .eq('id', shortData.id);
  } else {
    await supabase
      .from('newsletter_rate_limit')
      .insert({ ip_hash: ipHash, attempts: 1, window_start: new Date().toISOString() });
  }

  return { ok: true };
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
  const origin = req.headers.get('origin');
  const corsHeaders = buildCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let body: SubscribeRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      website,
    } = body;

    // Honeypot — se preenchido, descartar silenciosamente (200 OK falso)
    if (website && website.trim().length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Inscrição recebida.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validação básica
    if (!consent) {
      return new Response(
        JSON.stringify({ error: 'Consentimento é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'E-mail inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailHash = await hashString(normalizedEmail);
    const ipHash = await getIpHash(req);

    // Rate limiting
    const rl = await checkRateLimit(supabase, ipHash);
    if (!rl.ok) {
      await logEvent(
        supabase,
        'newsletter_error',
        emailHash,
        ipHash,
        { utmSource, utmMedium, utmCampaign, utmContent, utmTerm },
        pageSlug,
        `Rate limit: ${rl.reason}`
      );
      return new Response(
        JSON.stringify({ error: 'Muitas tentativas. Tente novamente mais tarde.' }),
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
      'user-agent': 'pqestudar-edge/1.0 (+https://pqestudar.com.br)',
    };

    // Check if contact already exists
    let isSubscribed = false;

    try {
      const getContactResponse = await fetch(`${brevoUrl}/${encodeURIComponent(normalizedEmail)}`, {
        method: 'GET',
        headers: brevoHeaders,
      });

      if (getContactResponse.ok) {
        const contactData = await getContactResponse.json();
        if (contactData.listIds && contactData.listIds.includes(parseInt(config.default_list_id))) {
          isSubscribed = true;
        }
      }
    } catch {
      // Não logar resposta crua — apenas marcar como falha não-crítica
      console.log('Brevo contact check: non-critical error');
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
      email: normalizedEmail,
      attributes,
      listIds: [parseInt(config.default_list_id)],
      updateEnabled: true,
    };

    const brevoResponse = await fetch(brevoUrl, {
      method: 'POST',
      headers: brevoHeaders,
      body: JSON.stringify(contactPayload),
    });

    if (!brevoResponse.ok) {
      // Sanitizar log: só status + code (sem responseText cru)
      let brevoCode: string | undefined;
      try {
        const errBody = await brevoResponse.json();
        brevoCode = errBody?.code;
      } catch {
        // ignora corpo não-JSON
      }
      console.error(`Brevo API error: status=${brevoResponse.status} code=${brevoCode ?? 'unknown'}`);

      await logEvent(
        supabase,
        'newsletter_error',
        emailHash,
        ipHash,
        { utmSource, utmMedium, utmCampaign, utmContent, utmTerm },
        pageSlug,
        `Brevo ${brevoResponse.status} ${brevoCode ?? ''}`.trim()
      );

      throw new Error('Erro ao criar contato na Brevo');
    }

    // Log successful listing — sem armazenar responseText cru
    await logEvent(
      supabase,
      'newsletter_subscribed',
      emailHash,
      ipHash,
      { utmSource, utmMedium, utmCampaign, utmContent, utmTerm },
      pageSlug,
      undefined,
      { brevoStatus: brevoResponse.status }
    );

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
    console.error('subscribe-newsletter-brevo error:', error?.message ?? 'unknown');

    return new Response(
      JSON.stringify({
        error: 'Erro ao processar inscrição',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
