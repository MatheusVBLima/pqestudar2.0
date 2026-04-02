import { useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { GlobalSeo } from "@/components/seo/GlobalSeo";
import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Star, BookOpen, Wrench, FileText } from "lucide-react";
import { useGuideBySlug, useGuideRelatedTools, useGuideRelatedContests, useGuideRelatedGuides } from "@/hooks/useGuides";
import { renderRichContentConcursos } from "@/lib/concursos-content-renderer";
import { MostReadGuides } from "@/components/guides/MostReadGuides";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ---------- CTA Block component ----------
function CtaBlock({ label, url, text }: { label?: string | null; url?: string | null; text?: string | null }) {
  if (!label || !url) return null;
  return (
    <div className="my-10 p-6 rounded-[1.2rem] bg-primary/5 border text-center space-y-3">
      {text && (
        <div
          className="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-2"
          dangerouslySetInnerHTML={{ __html: renderRichContentConcursos(text) }}
        />
      )}
      <Button asChild size="lg">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {label} <ExternalLink className="h-4 w-4 ml-2" />
        </a>
      </Button>
    </div>
  );
}

// ---------- Split content and insert middle CTA ----------
function splitContentForMiddleCta(html: string): [string, string] {
  const blockPattern = /(<\/(?:p|ul|ol|h[1-6]|blockquote|hr|table|div)>)/gi;
  const parts: { end: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = blockPattern.exec(html)) !== null) {
    parts.push({ end: match.index + match[0].length });
  }

  if (parts.length < 2) return [html, ""];

  const plainText = html.replace(/<[^>]+>/g, " ");
  const words = plainText.trim().split(/\s+/);
  const totalWords = words.length;

  if (totalWords < 120) {
    const splitIdx = Math.min(1, parts.length - 1);
    const splitPos = parts[splitIdx].end;
    return [html.slice(0, splitPos), html.slice(splitPos)];
  }

  const midWordIndex = Math.floor(totalWords / 2);
  let wordCount = 0;
  let charPos = 0;
  const textForCounting = html.replace(/<[^>]+>/g, (tag) => " ".repeat(tag.length));
  const wordRegex = /\S+/g;
  let wm: RegExpExecArray | null;
  while ((wm = wordRegex.exec(textForCounting)) !== null) {
    wordCount++;
    if (wordCount >= midWordIndex) {
      charPos = wm.index;
      break;
    }
  }

  let bestSplit = parts[Math.floor(parts.length / 2)].end;
  for (const p of parts) {
    if (p.end >= charPos) {
      bestSplit = p.end;
      break;
    }
  }

  return [html.slice(0, bestSplit), html.slice(bestSplit)];
}

export default function GuiaDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: guide, isLoading } = useGuideBySlug(slug);
  const { data: relatedTools } = useGuideRelatedTools(guide?.id);
  const { data: relatedContests } = useGuideRelatedContests(guide?.id);
  const { data: relatedGuides } = useGuideRelatedGuides(guide?.id);
  const viewTracked = useRef<string | null>(null);

  // Track view via RPC (once per slug per mount)
  useEffect(() => {
    if (slug && guide && viewTracked.current !== slug) {
      viewTracked.current = slug;
      supabase.rpc("increment_guide_view", { p_slug: slug }).then(({ error }) => {
        if (error) console.warn("Guide view track error:", error.message);
      });
    }
  }, [slug, guide]);

  if (isLoading) {
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

  if (!guide) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <BookOpen className="mx-auto h-16 w-16 text-muted-foreground/50 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Guia não encontrado</h1>
        <p className="text-muted-foreground mb-6">O guia que você procura não existe ou não está publicado.</p>
        <Button onClick={() => navigate("/guias")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar aos guias
        </Button>
      </div>
    );
  }

  const updatedDate = guide.updated_at
    ? format(new Date(guide.updated_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  const hasRelated = (relatedTools && relatedTools.length > 0) ||
    (relatedContests && relatedContests.length > 0) ||
    (relatedGuides && relatedGuides.length > 0);

  const internalLinks: Array<{ label: string; url: string }> = Array.isArray(guide.internal_links)
    ? (guide.internal_links as any[]).filter((l: any) => l.label && l.url)
    : [];

  const ctaTopText = guide.cta_top_text || null;
  const ctaMiddleText = guide.cta_middle_text || null;
  const ctaFinalText = guide.cta_final_text || null;

  const hasMiddleCta = !!(guide.cta_middle_label && guide.cta_middle_url);
  const fullHtml = renderRichContentConcursos(guide.content_markdown);

  let contentFirstHalf = fullHtml;
  let contentSecondHalf = "";
  if (hasMiddleCta) {
    [contentFirstHalf, contentSecondHalf] = splitContentForMiddleCta(fullHtml);
  }

  const authorName = (guide as any).author_name || "Equipe PqEstudar";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": guide.seo_title || guide.title,
    "description": guide.seo_description || guide.short_description,
    "author": { "@type": "Person", "name": authorName },
    "dateModified": guide.updated_at,
    "datePublished": guide.created_at,
    "publisher": {
      "@type": "Organization",
      "name": "PqEstudar",
      "url": "https://pqestudar.com.br"
    }
  };

  return (
    <>
      <GlobalSeo />
      <Helmet>
        <title>{guide.seo_title || guide.title}</title>
        <meta name="description" content={guide.seo_description || guide.short_description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <PageHero
        title={guide.title}
        description={guide.short_description}
        badge={
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant="outline" className="text-sm">
              {guide.category}
            </Badge>
            {guide.is_featured && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20" variant="outline">
                <Star className="h-3 w-3 mr-1" /> Destaque
              </Badge>
            )}
            {updatedDate && (
              <span className="text-xs text-muted-foreground">
                Por {authorName} · Atualizado em {updatedDate}
              </span>
            )}
            {!updatedDate && (
              <span className="text-xs text-muted-foreground">
                Por {authorName}
              </span>
            )}
          </div>
        }
      />

      {/* 2-column layout: content + sidebar */}
      <div className="container mx-auto px-6 pt-12 md:pt-16 pb-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          {/* Main content column */}
          <article className="flex-1 min-w-0 max-w-3xl">
            <CtaBlock label={guide.cta_top_label} url={guide.cta_top_url} text={ctaTopText} />

            <div
              className="text-foreground/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: contentFirstHalf }}
            />

            {hasMiddleCta && (
              <CtaBlock label={guide.cta_middle_label} url={guide.cta_middle_url} text={ctaMiddleText} />
            )}

            {contentSecondHalf && (
              <div
                className="text-foreground/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: contentSecondHalf }}
              />
            )}

            <CtaBlock label={guide.cta_final_label} url={guide.cta_final_url} text={ctaFinalText} />

            {/* Related sections */}
            {hasRelated && (
              <div className="mt-16 space-y-10">
                {relatedTools && relatedTools.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Wrench className="h-5 w-5" /> Ferramentas relacionadas
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {relatedTools.map((tool: any) => (
                        <Card key={tool.id} className="flex flex-col">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{tool.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm text-muted-foreground">
                            {tool.description?.slice(0, 100)}
                            {tool.url && (
                              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-primary underline text-xs">
                                Acessar ferramenta
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {relatedContests && relatedContests.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" /> Concursos relacionados
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {relatedContests.map((contest: any) => (
                        <Card key={contest.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              <Link to={`/concursos/${contest.slug}`} className="hover:text-primary transition-colors">
                                {contest.titulo}
                              </Link>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-2">
                              <Badge variant="outline">{contest.situacao}</Badge>
                              <Badge variant="outline">{contest.tipo}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {relatedGuides && relatedGuides.length > 0 && (
                  <section>
                    <p className="text-sm font-bold uppercase tracking-wide text-primary mb-5">Veja também</p>
                    <div className="space-y-5">
                      {relatedGuides.map((g: any) => (
                        <Link
                          key={g.id}
                          to={`/guias/${g.slug}`}
                          className="flex items-start gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                        >
                          <div className="w-20 h-16 sm:w-28 sm:h-20 shrink-0 rounded-md bg-accent flex items-center justify-center overflow-hidden">
                            <BookOpen className="h-6 w-6 text-primary/60" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                              {g.category}
                            </span>
                            <h3 className="text-base font-semibold leading-snug mt-0.5 group-hover:text-primary transition-colors line-clamp-2">
                              {g.title}
                            </h3>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Internal links */}
            {internalLinks.length > 0 && (
              <section className="mt-10 pt-6 border-t border-border">
                <p className="text-sm font-bold uppercase tracking-wide text-primary mb-5">Links úteis</p>
                <div className="space-y-5">
                  {internalLinks.map((link, i) => (
                    <Link
                      key={i}
                      to={link.url}
                      className="flex items-start gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                      aria-label={`Link útil: ${link.label}`}
                    >
                      <div className="w-20 h-16 sm:w-28 sm:h-20 shrink-0 rounded-md bg-accent flex items-center justify-center overflow-hidden">
                        <BookOpen className="h-6 w-6 text-primary/60" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          Link útil
                        </span>
                        <h3 className="text-base font-semibold leading-snug mt-0.5 group-hover:text-primary transition-colors line-clamp-2">
                          {link.label}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Back link */}
            <div className="mt-12">
              <Button variant="outline" onClick={() => navigate("/guias")}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar aos guias
              </Button>
            </div>
          </article>

          {/* Sidebar — desktop: sticky right column, mobile: below content */}
          <aside className="w-full lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-24">
              <MostReadGuides excludeSlug={slug} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
