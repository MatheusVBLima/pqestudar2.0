import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keywords indicating concluded/finished contests
const CONCLUDED_KEYWORDS = [
  "encerrado", "concluído", "concluido", "resultado final", 
  "prazo esgotado", "homologado", "expirado", "finalizado",
  "processo seletivo encerrado", "inscrições encerradas"
];

// Minimum content length to be considered valid
const MIN_CONTENT_LENGTH = 100;

interface ColetaRequest {
  action: "crawler" | "busca" | "manual";
  sites?: string[];
  depth?: number;
  limit?: number;
  urls?: string[];
  query?: string;
  anoAlvo?: number;
  ignoreAnalyzed?: boolean;
  ignoreNoDate?: boolean;
  ignoreOutOfYear?: boolean;
  metaObs?: string;
  extensoesBloqueadas?: string[];
  caminhosBloqueados?: string[];
  caminhosPermitidos?: string[];
}

interface ColetaResult {
  url: string;
  dominio: string;
  tipo_pagina: "listagem" | "detalhe";
  status: "novo" | "ignorado" | "erro";
  motivo?: string;
  textoLength?: number;
}

// Hash function using Web Crypto API
async function hashContent(text: string): Promise<string> {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Check if URL ends with blocked extension
function isBlockedExtension(url: string, blocked: string[]): boolean {
  const lowerUrl = url.toLowerCase();
  return blocked.some(ext => lowerUrl.endsWith(ext.toLowerCase()));
}

// Check if URL contains blocked path
function isBlockedPath(url: string, blocked: string[]): boolean {
  const lowerUrl = url.toLowerCase();
  return blocked.some(path => lowerUrl.includes(path.toLowerCase()));
}

// Check if URL contains at least one allowed path (if list is not empty)
function isAllowedPath(url: string, allowed: string[]): boolean {
  if (allowed.length === 0) return true; // Empty = allow all
  const lowerUrl = url.toLowerCase();
  return allowed.some(path => lowerUrl.includes(path.toLowerCase()));
}

// Detect page type: listagem vs detalhe
function detectPageType(html: string, text: string): "listagem" | "detalhe" {
  const linkCount = (html.match(/<a\s/gi) || []).length;
  const headingCount = (html.match(/<h[1-6]/gi) || []).length;
  const paragraphCount = (html.match(/<p/gi) || []).length;
  
  // Heuristics for listing pages
  const listingIndicators = [
    linkCount > 15,
    headingCount > 5,
    text.toLowerCase().includes("previstos"),
    text.toLowerCase().includes("novos concursos"),
    text.toLowerCase().includes("confira a lista"),
    text.toLowerCase().includes("veja todos"),
    paragraphCount < 3 && linkCount > 10,
  ];
  
  const listingScore = listingIndicators.filter(Boolean).length;
  
  // If more than 2 indicators match, it's likely a listing page
  return listingScore >= 2 ? "listagem" : "detalhe";
}

// Check if content indicates concluded contest
function isContentConcluded(text: string): boolean {
  const lowerText = text.toLowerCase();
  return CONCLUDED_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// Extract year from text (simple heuristic)
function extractYear(text: string): number | null {
  const currentYear = new Date().getFullYear();
  const yearMatches = text.match(/\b(20[2-9]\d)\b/g);
  if (!yearMatches) return null;
  
  const years = yearMatches.map(y => parseInt(y)).filter(y => y >= currentYear - 1 && y <= currentYear + 2);
  return years.length > 0 ? Math.max(...years) : null;
}

// Fetch and extract text from URL
async function fetchPageContent(url: string): Promise<{ html: string; text: string; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PqEstudarBot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      return { html: "", text: "", error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    
    // Basic HTML to text conversion
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, "")
      .replace(/\s+/g, " ")
      .trim();
    
    return { html, text };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { html: "", text: "", error: msg };
  }
}

// Simple link extraction for crawler
function extractLinks(html: string, baseUrl: string, allowedDomains: string[]): string[] {
  const links: string[] = [];
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;
  
  while ((match = hrefRegex.exec(html)) !== null) {
    try {
      const href = match[1];
      const absoluteUrl = new URL(href, baseUrl).href;
      const domain = extractDomain(absoluteUrl);
      
      if (allowedDomains.some(d => domain.includes(d) || d.includes(domain))) {
        if (!links.includes(absoluteUrl) && absoluteUrl.startsWith("http")) {
          links.push(absoluteUrl);
        }
      }
    } catch {
      // Invalid URL, skip
    }
  }
  
  return links;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ColetaRequest = await req.json();
    const { 
      action, 
      sites = [], 
      depth = 2, 
      limit = 50, 
      urls = [], 
      query = "", 
      anoAlvo, 
      ignoreAnalyzed = true, 
      ignoreNoDate = true, 
      ignoreOutOfYear = true, 
      metaObs = "",
      extensoesBloqueadas = [],
      caminhosBloqueados = [],
      caminhosPermitidos = [],
    } = body;
    
    const targetYear = anoAlvo || new Date().getFullYear();
    const results: ColetaResult[] = [];
    let urlsToProcess: string[] = [];

    console.debug(`[Coleta] Action: ${action}, Sites: ${sites.length}, Limit: ${limit}, Year: ${targetYear}`);

    // Determine URLs to process based on action
    if (action === "manual") {
      urlsToProcess = urls.filter(u => u.startsWith("http"));
    } else if (action === "crawler") {
      const visited = new Set<string>();
      const toVisit: { url: string; currentDepth: number }[] = [];
      
      for (const site of sites) {
        const siteUrl = site.startsWith("http") ? site : `https://${site}`;
        toVisit.push({ url: siteUrl, currentDepth: 0 });
      }
      
      while (toVisit.length > 0 && urlsToProcess.length < limit) {
        const { url, currentDepth } = toVisit.shift()!;
        
        if (visited.has(url)) continue;
        visited.add(url);
        
        urlsToProcess.push(url);
        
        if (currentDepth < depth) {
          try {
            const response = await fetch(url, {
              headers: { "User-Agent": "Mozilla/5.0 (compatible; PqEstudarBot/1.0)" }
            });
            const html = await response.text();
            const links = extractLinks(html, url, sites);
            
            for (const link of links.slice(0, 15)) {
              if (!visited.has(link) && urlsToProcess.length + toVisit.length < limit * 2) {
                toVisit.push({ url: link, currentDepth: currentDepth + 1 });
              }
            }
          } catch {
            // Failed to crawl, continue
          }
        }
      }
      
      urlsToProcess = urlsToProcess.slice(0, limit);
    } else if (action === "busca") {
      for (const site of sites) {
        const siteUrl = site.startsWith("http") ? site : `https://${site}`;
        urlsToProcess.push(siteUrl);
        
        const commonPaths = ["/concursos", "/editais", "/selecao", "/processo-seletivo", "/noticias"];
        for (const path of commonPaths) {
          if (urlsToProcess.length < limit) {
            urlsToProcess.push(`${siteUrl}${path}`);
          }
        }
      }
      
      urlsToProcess = urlsToProcess.slice(0, limit);
    }

    // Check for already analyzed URLs if needed
    let analyzedUrls = new Set<string>();
    if (ignoreAnalyzed) {
      const { data: existingUrls } = await supabase
        .from("itens_brutos")
        .select("url")
        .eq("ano_alvo", targetYear);
      
      if (existingUrls) {
        analyzedUrls = new Set(existingUrls.map(r => r.url));
      }
    }

    // Get existing hashes for dedup
    const { data: existingHashes } = await supabase
      .from("itens_brutos")
      .select("hash_conteudo")
      .eq("ano_alvo", targetYear)
      .not("hash_conteudo", "is", null);
    
    const hashSet = new Set(existingHashes?.map(h => h.hash_conteudo) || []);

    // Create run record
    const { data: runData, error: runError } = await supabase
      .from("coleta_runs")
      .insert({
        tipo_coleta: action,
        sites_env: sites,
        tema_consulta: query || null,
        ano_alvo: targetYear,
        profundidade: action === "crawler" ? depth : null,
        limite_paginas: action === "crawler" ? limit : null,
        limite_resultados: action === "busca" ? limit : null,
        filtros_snapshot: {
          extensoes_bloqueadas: extensoesBloqueadas,
          caminhos_bloqueados: caminhosBloqueados,
          caminhos_permitidos: caminhosPermitidos,
          ignoreAnalyzed,
          ignoreNoDate,
          ignoreOutOfYear,
        },
        total_urls: 0,
        total_novas: 0,
        total_ignoradas: 0,
        total_erros: 0,
        status_execucao: "ok",
      })
      .select("id")
      .single();

    if (runError) {
      console.error("[Coleta] Failed to create run:", runError);
      throw new Error("Failed to create run record");
    }

    const runId = runData.id;
    let totalNovas = 0;
    let totalIgnoradas = 0;
    let totalErros = 0;

    // Process each URL following the PIPELINE ORDER
    for (const url of urlsToProcess) {
      const dominio = extractDomain(url);

      // STEP 1: Block by extension
      if (isBlockedExtension(url, extensoesBloqueadas)) {
        results.push({ url, dominio, tipo_pagina: "detalhe", status: "ignorado", motivo: "extensao bloqueada" });
        totalIgnoradas++;
        
        await supabase.from("coleta_run_items").insert({
          run_id: runId,
          url,
          dominio,
          tipo_pagina: "detalhe",
          status: "ignorado",
          motivo_descartar: "extensao bloqueada",
          metodo_coleta: action,
          ano_alvo: targetYear,
        });
        
        continue;
      }

      // STEP 2: Block by path
      if (isBlockedPath(url, caminhosBloqueados)) {
        results.push({ url, dominio, tipo_pagina: "detalhe", status: "ignorado", motivo: "caminho bloqueado" });
        totalIgnoradas++;
        
        await supabase.from("coleta_run_items").insert({
          run_id: runId,
          url,
          dominio,
          tipo_pagina: "detalhe",
          status: "ignorado",
          motivo_descartar: "caminho bloqueado",
          metodo_coleta: action,
          ano_alvo: targetYear,
        });
        
        continue;
      }

      // Check allowed paths
      if (!isAllowedPath(url, caminhosPermitidos)) {
        results.push({ url, dominio, tipo_pagina: "detalhe", status: "ignorado", motivo: "caminho nao permitido" });
        totalIgnoradas++;
        
        await supabase.from("coleta_run_items").insert({
          run_id: runId,
          url,
          dominio,
          tipo_pagina: "detalhe",
          status: "ignorado",
          motivo_descartar: "caminho nao permitido",
          metodo_coleta: action,
          ano_alvo: targetYear,
        });
        
        continue;
      }

      // STEP 3: Already analyzed check
      if (ignoreAnalyzed && analyzedUrls.has(url)) {
        results.push({ url, dominio, tipo_pagina: "detalhe", status: "ignorado", motivo: "URL ja analisada" });
        totalIgnoradas++;
        
        await supabase.from("coleta_run_items").insert({
          run_id: runId,
          url,
          dominio,
          tipo_pagina: "detalhe",
          status: "ignorado",
          motivo_descartar: "URL ja analisada",
          metodo_coleta: action,
          ano_alvo: targetYear,
        });
        
        continue;
      }

      // Fetch content
      const { html, text, error } = await fetchPageContent(url);
      
      if (error) {
        results.push({ url, dominio, tipo_pagina: "detalhe", status: "erro", motivo: error });
        totalErros++;
        
        await supabase.from("coleta_run_items").insert({
          run_id: runId,
          url,
          dominio,
          tipo_pagina: "detalhe",
          status: "erro",
          motivo_descartar: error,
          metodo_coleta: action,
          ano_alvo: targetYear,
        });
        
        continue;
      }

      // STEP 4: Detect page type
      const tipoPagina = detectPageType(html, text);
      
      if (tipoPagina === "listagem") {
        // Listing pages are NOT saved to itens_brutos, only to run_items
        results.push({ url, dominio, tipo_pagina: "listagem", status: "ignorado", motivo: "pagina de listagem" });
        totalIgnoradas++;
        
        await supabase.from("coleta_run_items").insert({
          run_id: runId,
          url,
          dominio,
          tipo_pagina: "listagem",
          status: "ignorado",
          motivo_descartar: "pagina de listagem",
          metodo_coleta: action,
          ano_alvo: targetYear,
        });
        
        continue;
      }

      // STEP 5: Check minimum content length
      if (text.length < MIN_CONTENT_LENGTH) {
        results.push({ url, dominio, tipo_pagina: "detalhe", status: "ignorado", motivo: "sem texto relevante" });
        totalIgnoradas++;
        
        await supabase.from("coleta_run_items").insert({
          run_id: runId,
          url,
          dominio,
          tipo_pagina: "detalhe",
          status: "ignorado",
          motivo_descartar: "sem texto relevante",
          metodo_coleta: action,
          ano_alvo: targetYear,
        });
        
        continue;
      }

      // Check for concluded content
      if (isContentConcluded(text)) {
        results.push({ url, dominio, tipo_pagina: "detalhe", status: "ignorado", motivo: "concurso encerrado" });
        totalIgnoradas++;
        
        await supabase.from("coleta_run_items").insert({
          run_id: runId,
          url,
          dominio,
          tipo_pagina: "detalhe",
          status: "ignorado",
          motivo_descartar: "concurso encerrado",
          metodo_coleta: action,
          ano_alvo: targetYear,
        });
        
        continue;
      }

      // STEP 6: Check year
      if (ignoreOutOfYear) {
        const detectedYear = extractYear(text);
        if (detectedYear && detectedYear !== targetYear) {
          results.push({ url, dominio, tipo_pagina: "detalhe", status: "ignorado", motivo: `fora do ano alvo (${detectedYear})` });
          totalIgnoradas++;
          
          await supabase.from("coleta_run_items").insert({
            run_id: runId,
            url,
            dominio,
            tipo_pagina: "detalhe",
            status: "ignorado",
            motivo_descartar: `fora do ano alvo (${detectedYear})`,
            metodo_coleta: action,
            ano_alvo: targetYear,
          });
          
          continue;
        }
      }

      // STEP 7: Check hash dedup
      const contentHash = await hashContent(text);
      if (hashSet.has(contentHash)) {
        results.push({ url, dominio, tipo_pagina: "detalhe", status: "ignorado", motivo: "duplicada" });
        totalIgnoradas++;
        
        await supabase.from("coleta_run_items").insert({
          run_id: runId,
          url,
          dominio,
          tipo_pagina: "detalhe",
          status: "ignorado",
          motivo_descartar: "duplicada",
          metodo_coleta: action,
          ano_alvo: targetYear,
          hash_conteudo: contentHash,
        });
        
        continue;
      }

      // STEP 8: All checks passed - save as new to itens_brutos
      hashSet.add(contentHash);
      analyzedUrls.add(url);
      
      const { error: insertError } = await supabase.from("itens_brutos").upsert({
        url,
        dominio,
        texto_bruto: text,
        hash_conteudo: contentHash,
        metodo_coleta: action,
        ano_alvo: targetYear,
        status: "novo",
        motivo_status: null,
        meta_obs: action === "manual" ? metaObs : null,
      }, { onConflict: "url,ano_alvo" });

      if (insertError) {
        results.push({ url, dominio, tipo_pagina: "detalhe", status: "erro", motivo: insertError.message });
        totalErros++;
        
        await supabase.from("coleta_run_items").insert({
          run_id: runId,
          url,
          dominio,
          tipo_pagina: "detalhe",
          status: "erro",
          motivo_descartar: insertError.message,
          metodo_coleta: action,
          ano_alvo: targetYear,
        });
      } else {
        results.push({ url, dominio, tipo_pagina: "detalhe", status: "novo", textoLength: text.length });
        totalNovas++;
        
        await supabase.from("coleta_run_items").insert({
          run_id: runId,
          url,
          dominio,
          tipo_pagina: "detalhe",
          status: "novo",
          motivo_descartar: null,
          metodo_coleta: action,
          ano_alvo: targetYear,
          texto_bruto: text,
          hash_conteudo: contentHash,
          meta_obs: action === "manual" ? metaObs : null,
        });
      }
    }

    // Update run with final counts
    const statusExecucao = totalErros > 0 && totalNovas === 0 ? "erro" : totalErros > 0 ? "parcial" : "ok";
    
    await supabase.from("coleta_runs").update({
      total_urls: results.length,
      total_novas: totalNovas,
      total_ignoradas: totalIgnoradas,
      total_erros: totalErros,
      status_execucao: statusExecucao,
    }).eq("id", runId);

    // Summary
    const summary = {
      total: results.length,
      novos: totalNovas,
      ignorados: totalIgnoradas,
      erros: totalErros,
    };

    console.debug(`[Coleta] Complete - Total: ${summary.total}, New: ${summary.novos}, Ignored: ${summary.ignorados}, Errors: ${summary.erros}`);

    return new Response(JSON.stringify({ success: true, results, summary, runId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Coleta] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
