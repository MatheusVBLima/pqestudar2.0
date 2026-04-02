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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GuiaDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: guide, isLoading } = useGuideBySlug(slug);
  const { data: relatedTools } = useGuideRelatedTools(guide?.id);
  const { data: relatedContests } = useGuideRelatedContests(guide?.id);
  const { data: relatedGuides } = useGuideRelatedGuides(guide?.id);

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

  return (
    <>
      <GlobalSeo />
      <Helmet>
        <title>{guide.seo_title || guide.title}</title>
        <meta name="description" content={guide.seo_description || guide.short_description} />
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
                Atualizado em {updatedDate}
              </span>
            )}
          </div>
        }
      >
        {guide.cta_top_label && guide.cta_top_url && (
          <div className="mt-6">
            <Button asChild size="lg">
              <a href={guide.cta_top_url} target="_blank" rel="noopener noreferrer">
                {guide.cta_top_label} <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        )}
      </PageHero>

      <article className="container mx-auto px-6 pt-12 md:pt-16 pb-16 max-w-3xl">
        {/* Main content */}
        <div
          className="text-foreground/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderRichContentConcursos(guide.content_markdown) }}
        />

        {/* CTA middle */}
        {guide.cta_middle_label && guide.cta_middle_url && (
          <div className="my-10 p-6 rounded-[1.2rem] bg-primary/5 border text-center">
            <Button asChild size="lg">
              <a href={guide.cta_middle_url} target="_blank" rel="noopener noreferrer">
                {guide.cta_middle_label} <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        )}

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
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Outros guias
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedGuides.map((g: any) => (
                    <Card key={g.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/guias/${g.slug}`)}>
                      <CardHeader className="pb-2">
                        <Badge variant="outline" className="w-fit mb-1">{g.category}</Badge>
                        <CardTitle className="text-base">{g.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {g.short_description}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* CTA final */}
        {guide.cta_final_label && guide.cta_final_url && (
          <div className="mt-12 p-8 rounded-[1.2rem] bg-primary/5 border text-center">
            <Button asChild size="lg">
              <a href={guide.cta_final_url} target="_blank" rel="noopener noreferrer">
                {guide.cta_final_label} <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        )}

        {/* Back link */}
        <div className="mt-12">
          <Button variant="outline" onClick={() => navigate("/guias")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar aos guias
          </Button>
        </div>
      </article>
    </>
  );
}
