import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Bot patterns to block
const BOT_PATTERNS = [
  /bot/i, /spider/i, /crawl/i, /headless/i, /monitor/i, /lighthouse/i,
  /googlebot/i, /bingbot/i, /yandex/i, /baidu/i, /duckduck/i, /slurp/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i, /whatsapp/i,
  /telegram/i, /discord/i, /applebot/i, /semrush/i, /ahref/i, /mj12bot/i,
  /dotbot/i, /petalbot/i, /bytespider/i, /curl/i, /wget/i, /python/i,
  /java/i, /go-http/i, /axios/i, /node-fetch/i, /phantom/i, /puppeteer/i,
  /selenium/i, /playwright/i, /webdriver/i, /chrome-lighthouse/i,
];

// Simple in-memory rate limiter (per cold start, so partial protection)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 20; // requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function isBot(ua: string): boolean {
  if (!ua) return true; // No UA = suspicious
  return BOT_PATTERNS.some(pattern => pattern.test(ua));
}

async function hashFingerprint(ip: string, ua: string, dia: string): Promise<string> {
  const data = `${ip}:${ua}:${dia}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Get IP from headers (Cloudflare/Supabase edge)
    const ip = req.headers.get("x-real-ip") || 
               req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               req.headers.get("cf-connecting-ip") ||
               "unknown";
    
    const ua = req.headers.get("user-agent") || "";

    // Rate limiting
    if (isRateLimited(ip)) {
      return new Response(null, { status: 429, headers: corsHeaders });
    }

    // Bot detection
    if (isBot(ua)) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Parse body
    let body: { oportunidadeId?: string; viewportWidth?: number };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { oportunidadeId, viewportWidth } = body;

    if (!oportunidadeId || typeof oportunidadeId !== "string") {
      return new Response(JSON.stringify({ error: "oportunidadeId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Viewport validation (basic anti-headless)
    if (viewportWidth !== undefined && viewportWidth < 320) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Initialize admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if oportunidade exists and is published
    const { data: oportunidade, error: fetchError } = await adminClient
      .from("oportunidades")
      .select("id, publicado, views_total")
      .eq("id", oportunidadeId)
      .single();

    if (fetchError || !oportunidade) {
      return new Response(JSON.stringify({ error: "Oportunidade not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!oportunidade.publicado) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Calculate fingerprint
    const dia = new Date().toISOString().split("T")[0]; // UTC date
    const fp = await hashFingerprint(ip, ua, dia);

    // Check if fingerprint already exists (dedupe)
    const { data: existingFp } = await adminClient
      .from("oportunidade_view_fingerprints")
      .select("id")
      .eq("oportunidade_id", oportunidadeId)
      .eq("dia", dia)
      .eq("fp", fp)
      .maybeSingle();

    if (existingFp) {
      // Already counted today, return current total without incrementing
      return new Response(JSON.stringify({ total: oportunidade.views_total, dedupe: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert fingerprint (upsert to handle race conditions)
    const { error: fpError } = await adminClient
      .from("oportunidade_view_fingerprints")
      .upsert(
        { oportunidade_id: oportunidadeId, dia, fp, ua: ua.substring(0, 500) },
        { onConflict: "oportunidade_id,dia,fp", ignoreDuplicates: true }
      );

    if (fpError) {
      console.error("Error inserting fingerprint:", fpError);
      // Continue anyway - fingerprint is for dedupe, not critical
    }

    // Upsert daily view count - try insert first, then update if exists
    const { data: existingView } = await adminClient
      .from("oportunidade_views")
      .select("id, total")
      .eq("oportunidade_id", oportunidadeId)
      .eq("dia", dia)
      .maybeSingle();

    if (existingView) {
      // Update existing row
      await adminClient
        .from("oportunidade_views")
        .update({ total: (existingView.total || 0) + 1 })
        .eq("id", existingView.id);
    } else {
      // Insert new row
      await adminClient
        .from("oportunidade_views")
        .insert({ oportunidade_id: oportunidadeId, dia, total: 1 });
    }

    // Increment views_total on oportunidades
    const { data: updated, error: updateError } = await adminClient
      .from("oportunidades")
      .update({ views_total: (oportunidade.views_total || 0) + 1 })
      .eq("id", oportunidadeId)
      .select("views_total")
      .single();

    if (updateError) {
      console.error("Error updating views_total:", updateError);
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ total: updated?.views_total || 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Track view error:", error);
    return new Response(null, { status: 204, headers: corsHeaders });
  }
});
