import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { ArrowRight, Eye, FileText, Globe, MapPin, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── Types ─── */

interface ToolPreview {
  id: string;
  name: string;
  description: string;
  url?: string;
  icon_url?: string;
  tags: string[];
}

interface ConcursoPreview {
  id: string;
  titulo: string;
  slug: string;
  categoria: string;
  situacao: string;
  abrangencia: string;
  data_publicacao: string;
  views_total: number;
}

/* ─── Style maps (same as Concursos page) ─── */

const CATEGORIA_COLORS: Record<string, string> = {
  Concurso: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Políticas Públicas": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Educação: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const SITUACAO_COLORS: Record<string, string> = {
  Previsto: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Edital publicado": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Aberto: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Encerrado: "bg-muted text-muted-foreground border-muted",
};

/* ─── Data hooks ─── */

function useFeaturedTools() {
  return useQuery({
    queryKey: ["home-featured-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools_public")
        .select("id, name, description, url, icon_url, tags")
        .order("sort_order", { ascending: true })
        .limit(3);

      if (error) throw error;
      return (data || []) as ToolPreview[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useTopConcursos() {
  return useQuery({
    queryKey: ["home-top-concursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oportunidades_public")
        .select("id, titulo, slug, categoria, situacao, abrangencia, data_publicacao, visualizacoes")
        .order("visualizacoes", { ascending: false })
        .limit(3);

      if (error) throw error;
      return ((data || []) as unknown as ConcursoPreview[]).map(d => ({
        ...d,
        views_total: (d as any).visualizacoes ?? 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/* ─── Mini-cards ─── */

function MiniToolCard({ tool }: { tool: ToolPreview }) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border shrink-0">
            {tool.icon_url ? (
              <img
                src={tool.icon_url}
                alt={`Logo de ${tool.name}`}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
          </div>
          <CardTitle className="text-base leading-tight">{tool.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0">
        <CardDescription className="text-sm leading-relaxed flex-1 mb-3 line-clamp-2">
          {tool.description}
        </CardDescription>
        <div className="flex flex-wrap gap-1 mb-3">
          {tool.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        {tool.url && (
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-[1.2rem]"
            asChild
          >
            <a href={tool.url} target="_blank" rel="noopener noreferrer">
              Acessar
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function MiniConcursoCard({ item }: { item: ConcursoPreview }) {
  const navigate = useNavigate();

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className={CATEGORIA_COLORS[item.categoria] || ""}>
            {item.categoria}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Eye className="h-3 w-3" />
            {item.views_total.toLocaleString("pt-BR")}
          </div>
        </div>
        <h4 className="text-base font-semibold line-clamp-2 mt-1">{item.titulo}</h4>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0">
        <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            <span className="text-xs">
              {format(new Date(item.data_publicacao), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {item.abrangencia === "Nacional" ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
            <span className="text-xs">{item.abrangencia}</span>
          </div>
        </div>
        <Badge variant="outline" className={`w-fit mb-3 ${SITUACAO_COLORS[item.situacao] || ""}`}>
          {item.situacao}
        </Badge>
        <Button
          size="sm"
          className="w-full mt-auto rounded-[1.2rem]"
          onClick={() => navigate(`/concursos/${item.slug}`)}
        >
          Ver detalhes
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Skeletons ─── */

function CardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-2/3 mb-4" />
        <Skeleton className="h-8 w-full rounded-[1.2rem]" />
      </CardContent>
    </Card>
  );
}

/* ─── Main Section ─── */

export function DualTrackSection() {
  const toolsQuery = useFeaturedTools();
  const concursosQuery = useTopConcursos();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Por onde quer começar?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha uma trilha e veja os destaques de agora.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Column A — Ferramentas */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <Badge variant="secondary" className="mb-3 text-xs">
                Top 3 da semana
              </Badge>
              <p className="text-sm text-muted-foreground mb-1">
                Resolva problemas rápido
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Ferramentas em destaque
              </h3>
              <Button variant="hero" size="sm" className="rounded-[1.2rem] gap-1" asChild>
                <Link to="/ferramentas">
                  Explorar Ferramentas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {toolsQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              ) : toolsQuery.data && toolsQuery.data.length > 0 ? (
                toolsQuery.data.map((tool) => (
                  <MiniToolCard key={tool.id} tool={tool} />
                ))
              ) : (
                <p className="text-muted-foreground text-sm py-6 text-center">
                  Em breve novos destaques.
                </p>
              )}
            </div>
          </motion.div>

          {/* Column B — Concursos */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-6"
          >
            <div>
              <Badge variant="secondary" className="mb-3 text-xs">
                Mais acessados
              </Badge>
              <p className="text-sm text-muted-foreground mb-1">
                Acompanhe oportunidades com clareza
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Concursos mais acessados
              </h3>
              <Button variant="hero" size="sm" className="rounded-[1.2rem] gap-1" asChild>
                <Link to="/concursos">
                  Ver Concursos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {concursosQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              ) : concursosQuery.data && concursosQuery.data.length > 0 ? (
                concursosQuery.data.map((item) => (
                  <MiniConcursoCard key={item.id} item={item} />
                ))
              ) : (
                <p className="text-muted-foreground text-sm py-6 text-center">
                  Sem concursos em destaque no momento.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
