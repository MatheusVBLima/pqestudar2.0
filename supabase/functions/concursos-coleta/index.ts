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
}

interface ColetaResult {
  url: string;
  dominio: string;
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
  
  // Find most recent year mentioned
  const years = yearMatches.map(y => parseInt(y)).filter(y => y >= currentYear - 1 && y <= currentYear + 1);
  return years.length > 0 ? Math.max(...years) : null;
}

// Fetch and extract text from URL
async function fetchPageContent(url: string): Promise<{ text: string; error?: string }> {
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
      return { text: "", error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    
    // Basic HTML to text conversion
    let text = html
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
    
    return { text };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { text: "", error: msg };
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
    const { action, sites = [], depth = 1, limit = 20, urls = [], query = "", anoAlvo, ignoreAnalyzed = true, ignoreNoDate = true, ignoreOutOfYear = true, metaObs = "" } = body;
    
    const targetYear = anoAlvo || new Date().getFullYear();
    const results: ColetaResult[] = [];
    let urlsToProcess: string[] = [];

    console.debug(`[Coleta] Action: ${action}, Sites: ${sites.length}, Limit: ${limit}, Year: ${targetYear}`);

    // Determine URLs to process based on action
    if (action === "manual") {
      urlsToProcess = urls.filter(u => u.startsWith("http"));
    } else if (action === "crawler") {
      // For crawler, start with site homepages and crawl
      const visited = new Set<string>();
      const toVisit: { url: string; currentDepth: number }[] = [];
      
      // Initialize with site root URLs
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
            
            for (const link of links.slice(0, 10)) { // Limit links per page
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
      // For search, we scan existing content within whitelist domains
      // Since we can't use Google, we do a basic internal search
      // This is a simplified approach - in real implementation, you'd have indexed content
      for (const site of sites) {
        const siteUrl = site.startsWith("http") ? site : `https://${site}`;
        urlsToProcess.push(siteUrl);
        
        // Try common paths that might have relevant content
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

    // Process each URL
    for (const url of urlsToProcess) {
      // Skip if already analyzed
      if (ignoreAnalyzed && analyzedUrls.has(url)) {
        results.push({ url, dominio: extractDomain(url), status: "ignorado", motivo: "URL já analisada" });
        continue;
      }

      const dominio = extractDomain(url);
      
      // Fetch content
      const { text, error } = await fetchPageContent(url);
      
      if (error) {
        results.push({ url, dominio, status: "erro", motivo: error });
        
        // Save error to DB
        await supabase.from("itens_brutos").upsert({
          url,
          dominio,
          texto_bruto: null,
          metodo_coleta: action,
          ano_alvo: targetYear,
          status: "erro",
          motivo_status: error,
          meta_obs: action === "manual" ? metaObs : null,
        }, { onConflict: "url,ano_alvo" });
        
        continue;
      }

      // Check minimum content length
      if (text.length < MIN_CONTENT_LENGTH) {
        results.push({ url, dominio, status: "ignorado", motivo: "Conteúdo insuficiente" });
        
        await supabase.from("itens_brutos").upsert({
          url,
          dominio,
          texto_bruto: text,
          metodo_coleta: action,
          ano_alvo: targetYear,
          status: "ignorado",
          motivo_status: "Conteúdo insuficiente",
          meta_obs: action === "manual" ? metaObs : null,
        }, { onConflict: "url,ano_alvo" });
        
        continue;
      }

      // Check for concluded content
      if (isContentConcluded(text)) {
        results.push({ url, dominio, status: "ignorado", motivo: "Concurso encerrado/concluído" });
        
        await supabase.from("itens_brutos").upsert({
          url,
          dominio,
          texto_bruto: text,
          metodo_coleta: action,
          ano_alvo: targetYear,
          status: "ignorado",
          motivo_status: "Concurso encerrado/concluído",
          meta_obs: action === "manual" ? metaObs : null,
        }, { onConflict: "url,ano_alvo" });
        
        continue;
      }

      // Check year if enabled
      if (ignoreOutOfYear) {
        const detectedYear = extractYear(text);
        if (detectedYear && detectedYear !== targetYear) {
          results.push({ url, dominio, status: "ignorado", motivo: `Ano ${detectedYear} fora do alvo ${targetYear}` });
          
          await supabase.from("itens_brutos").upsert({
            url,
            dominio,
            texto_bruto: text,
            metodo_coleta: action,
            ano_alvo: targetYear,
            status: "ignorado",
            motivo_status: `Ano ${detectedYear} fora do alvo ${targetYear}`,
            meta_obs: action === "manual" ? metaObs : null,
          }, { onConflict: "url,ano_alvo" });
          
          continue;
        }
      }

      // Check hash dedup
      const contentHash = await hashContent(text);
      if (hashSet.has(contentHash)) {
        results.push({ url, dominio, status: "ignorado", motivo: "Hash duplicado" });
        
        await supabase.from("itens_brutos").upsert({
          url,
          dominio,
          texto_bruto: text,
          hash_conteudo: contentHash,
          metodo_coleta: action,
          ano_alvo: targetYear,
          status: "ignorado",
          motivo_status: "Hash duplicado",
          meta_obs: action === "manual" ? metaObs : null,
        }, { onConflict: "url,ano_alvo" });
        
        continue;
      }

      // All checks passed - save as new
      hashSet.add(contentHash);
      
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
        results.push({ url, dominio, status: "erro", motivo: insertError.message });
      } else {
        results.push({ url, dominio, status: "novo", textoLength: text.length });
      }
    }

    // Summary
    const summary = {
      total: results.length,
      novos: results.filter(r => r.status === "novo").length,
      ignorados: results.filter(r => r.status === "ignorado").length,
      erros: results.filter(r => r.status === "erro").length,
    };

    console.debug(`[Coleta] Complete - Total: ${summary.total}, New: ${summary.novos}, Ignored: ${summary.ignorados}, Errors: ${summary.erros}`);

    return new Response(JSON.stringify({ success: true, results, summary }), {
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
