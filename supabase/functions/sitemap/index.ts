// Sitemap dinâmico — gera XML em tempo real a partir do banco.
// URL pública: https://omkxiomwzbykmqttfozi.supabase.co/functions/v1/sitemap

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const BASE_URL = "https://pqestudar.com.br";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STATIC_ROUTES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/ferramentas", changefreq: "weekly", priority: "0.9" },
  { path: "/concursos", changefreq: "daily", priority: "0.9" },
  { path: "/guias", changefreq: "daily", priority: "0.9" },
  { path: "/produtos", changefreq: "weekly", priority: "0.8" },
  { path: "/votacoes", changefreq: "weekly", priority: "0.7" },
  { path: "/sobre-pqestudar", changefreq: "monthly", priority: "0.6" },
  { path: "/termos", changefreq: "monthly", priority: "0.3" },
  { path: "/privacidade", changefreq: "monthly", priority: "0.3" },
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIsoDate(d: string | null | undefined): string | null {
  if (!d) return null;
  try {
    return new Date(d).toISOString();
  } catch {
    return null;
  }
}

function urlEntry(loc: string, lastmod: string | null, changefreq: string, priority: string): string {
  const lm = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lm}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Guias publicados
    const { data: guides, error: guidesError } = await supabase
      .from("guides")
      .select("slug, updated_at")
      .eq("is_published", true)
      .not("slug", "is", null);

    if (guidesError) console.error("guides error:", guidesError);

    // Concursos publicados (não deletados)
    const { data: concursos, error: concursosError } = await supabase
      .from("oportunidades")
      .select("slug, updated_at, published_at, data_publicacao")
      .eq("publicado", true)
      .is("deleted_at", null)
      .not("slug", "is", null);

    if (concursosError) console.error("concursos error:", concursosError);

    const parts: string[] = [];

    for (const r of STATIC_ROUTES) {
      parts.push(urlEntry(`${BASE_URL}${r.path}`, null, r.changefreq, r.priority));
    }

    for (const g of guides ?? []) {
      if (!g.slug) continue;
      parts.push(
        urlEntry(
          `${BASE_URL}/guias/${g.slug}`,
          toIsoDate(g.updated_at as string | null),
          "weekly",
          "0.8",
        ),
      );
    }

    for (const c of concursos ?? []) {
      if (!c.slug) continue;
      const lastmod =
        toIsoDate((c as any).updated_at) ??
        toIsoDate((c as any).published_at) ??
        toIsoDate((c as any).data_publicacao);
      parts.push(urlEntry(`${BASE_URL}/concursos/${c.slug}`, lastmod, "weekly", "0.8"));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${parts.join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=900, s-maxage=900",
      },
    });
  } catch (err) {
    console.error("sitemap error:", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8" },
      },
    );
  }
});
