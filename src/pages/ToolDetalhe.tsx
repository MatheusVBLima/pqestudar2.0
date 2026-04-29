import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { GlobalSeo } from "@/components/seo/GlobalSeo";
import { PageHero } from "@/components/layout/PageHero";
import { renderHighlightedTitle } from "@/lib/highlight-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Wrench, Sparkles, CheckCircle2, AlertTriangle, Users, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { renderMarkdownContent } from "@/lib/concursos-content-renderer";
import { SaveToolButton } from "@/components/ui/save-tool-button";
import { useAnalyticsTracker } from "@/hooks/useAnalyticsTracker";
import { Tool } from "@/hooks/useTools";

// ---------- Helpers ----------

/** Render a textual block as markdown (fallback to whitespace-pre-line if simple). */
function ProseBlock({ html }: { html: string }) {
  return (
    <div
      className="guide-content text-foreground/80 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface SectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string | null | undefined;
  variant?: "default" | "pros" | "cons";
}

function Section({ icon: Icon, title, content, variant = "default" }: SectionProps) {
  if (!content || !content.trim()) return null;
  const html = renderMarkdownContent(content);

  const accent =
    variant === "pros"
      ? "text-emerald-500"
      : variant === "cons"
      ? "text-amber-500"
      : "text-primary";

  return (
    <section className="mb-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${accent}`} />
        {title}
      </h2>
      <ProseBlock html={html} />
    </section>
  );
}

function ToolHeroCta({ tool }: { tool: Tool }) {
  const { track } = useAnalyticsTracker();
  if (!tool.url) return null;

  const onClick = () => {
    track({
      event_name: "tool_outbound_click",
      entity_type: "tool",
      entity_id: tool.id,
      path: `/ferramentas/${tool.slug || ""}`,
      meta: { tool_slug: tool.slug, tool_name: tool.name, source: "detail_page" },
    });
  };

  return (
    <Button asChild size="lg" className="rounded-[1.2rem]" data-evt="access_tool">
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="inline-flex items-center gap-2"
        aria-label={`Acessar ${tool.name} (abre em nova aba)`}
      >
        Acessar ferramenta
        <ExternalLink className="h-4 w-4" />
      </a>
    </Button>
  );
}

// ---------- Page ----------

export default function ToolDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool | null>(null);
  const [related, setRelated] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      const { data, error } = await supabase
        .from("tools_public")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setTool(null);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTool(data as Tool);

      // Related: tools sharing at least one tag
      if (Array.isArray((data as any).tags) && (data as any).tags.length > 0) {
        const { data: rel } = await supabase
          .from("tools_public")
          .select("*")
          .neq("id", (data as any).id)
          .overlaps("tags", (data as any).tags)
          .order("sort_order", { ascending: true })
          .limit(4);
        if (!cancelled) setRelated((rel || []) as Tool[]);
      } else {
        setRelated([]);
      }

      setLoading(false);
    }
    if (slug) load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <>
        <PageHero title="" description="" isLoading />
        <div className="container mx-auto px-6 pt-12 pb-16 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </>
    );
  }

  if (notFound || !tool) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <Wrench className="mx-auto h-16 w-16 text-muted-foreground/50 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Ferramenta não encontrada</h1>
        <p className="text-muted-foreground mb-6">
          A ferramenta que você procura não existe ou não está visível.
        </p>
        <Button onClick={() => navigate("/ferramentas")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao catálogo
        </Button>
      </div>
    );
  }

  const seoTitle = tool.seo_title || `${tool.name} — Ferramenta | PqEstudar`;
  const seoDescription = tool.seo_description || tool.description;

  const hasEditorialContent =
    !!(tool.what_is || tool.who_for || tool.how_helps || tool.pros || tool.cons || tool.extra_markdown);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: seoDescription,
    applicationCategory: tool.tags?.[0] || "WebApplication",
    image: tool.icon_url || undefined,
    url: tool.url || undefined,
  };

  return (
    <>
      <GlobalSeo />
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <PageHero
        title={tool.name}
        description={tool.description}
        badge={
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {tool.icon_url && (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border shadow-sm shrink-0 mr-2">
                <img
                  src={tool.icon_url}
                  alt={`Logo de ${tool.name}`}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            {(tool.tags || []).map((tag) => (
              <Badge key={tag} variant="outline" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <ToolHeroCta tool={tool} />
          <SaveToolButton toolId={tool.id} toolName={tool.name} />
          <Button asChild variant="ghost" size="lg" className="rounded-[1.2rem]">
            <Link to="/ferramentas" aria-label="Voltar ao catálogo">
              <ArrowLeft className="h-4 w-4 mr-2" /> Catálogo
            </Link>
          </Button>
        </motion.div>
      </PageHero>

      {/* Body */}
      <div className="container mx-auto px-6 pt-12 md:pt-16 pb-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          <article className="flex-1 min-w-0 max-w-3xl">
            {hasEditorialContent ? (
              <>
                <Section icon={Sparkles} title="O que é" content={tool.what_is} />
                <Section icon={Users} title="Para quem serve" content={tool.who_for} />
                <Section icon={Lightbulb} title="Como pode ajudar" content={tool.how_helps} />
                <Section icon={CheckCircle2} title="Vantagens" content={tool.pros} variant="pros" />
                <Section icon={AlertTriangle} title="Limitações" content={tool.cons} variant="cons" />
                {tool.extra_markdown && (
                  <section className="mb-10">
                    <ProseBlock html={renderMarkdownContent(tool.extra_markdown)} />
                  </section>
                )}
              </>
            ) : (
              <p className="text-muted-foreground leading-relaxed">
                Conteúdo editorial completo em breve. Por enquanto, acesse a ferramenta diretamente
                pelo botão abaixo.
              </p>
            )}

            {/* Final CTA */}
            {tool.url && (
              <div className="my-10 p-6 rounded-[1.2rem] bg-primary/5 border text-center space-y-4">
                <h2 className="text-xl md:text-2xl font-bold">
                  Pronto para experimentar {tool.name}?
                </h2>
                <p className="text-sm text-muted-foreground max-w-prose mx-auto">
                  Acesse o link oficial e comece agora.
                </p>
                <div className="flex justify-center">
                  <ToolHeroCta tool={tool} />
                </div>
              </div>
            )}

            {/* Related tools */}
            {related.length > 0 && (
              <section className="mt-16">
                <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                  <Wrench className="h-5 w-5" /> Ferramentas relacionadas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((rt) => (
                    <Link
                      key={rt.id}
                      to={`/ferramentas/${rt.slug}`}
                      className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-[1.2rem]"
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow rounded-[1.2rem]">
                        <CardContent className="p-5 flex gap-4 items-start">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border shadow-sm shrink-0">
                            {rt.icon_url ? (
                              <img
                                src={rt.icon_url}
                                alt={`Logo de ${rt.name}`}
                                className="w-full h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Wrench className="w-5 h-5 text-primary" aria-hidden="true" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                              {rt.name}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {rt.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
