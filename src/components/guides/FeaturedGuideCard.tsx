import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Star, Eye, EyeOff, StarOff, Edit, Trash2 } from "lucide-react";
import { Guide } from "@/hooks/useGuides";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATEGORY_COLORS: Record<string, string> = {
  Concursos: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Ferramentas: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Oportunidades: "bg-green-500/10 text-green-600 border-green-500/20",
  Produtividade: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Carreira: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

interface FeaturedGuideCardProps {
  guide: Guide;
  showAdmin: boolean;
  onEdit: (guide: Guide) => void;
  onDelete: (guide: Guide) => void;
  onTogglePublished: (guide: Guide) => void;
  onToggleFeatured: (guide: Guide) => void;
}

export function FeaturedGuideCard({
  guide,
  showAdmin,
  onEdit,
  onDelete,
  onTogglePublished,
  onToggleFeatured,
}: FeaturedGuideCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!showAdmin) navigate(`/guias/${guide.slug}`);
  };

  const updatedDate = guide.updated_at
    ? format(new Date(guide.updated_at), "d 'de' MMM, yyyy", { locale: ptBR })
    : null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Destaque
        </span>
      </div>

      <Card
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleClick}
      >
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="md:w-2/5 bg-accent flex items-center justify-center min-h-[200px] md:min-h-[260px] overflow-hidden">
            {(guide as any).cover_image_url ? (
              <img
                src={(guide as any).cover_image_url}
                alt={guide.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <BookOpen className="h-16 w-16 text-primary/30" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {(() => { const cat = (guide as any).public_category || guide.category; return (
                <Badge
                  variant="outline"
                  className={CATEGORY_COLORS[cat] || ""}
                >
                  {cat}
                </Badge>
              ); })()}
              {showAdmin && !guide.is_published && (
                <Badge variant="secondary">Rascunho</Badge>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
              {guide.title}
            </h2>

            <p className="text-muted-foreground line-clamp-3 mb-4 text-base">
              {guide.short_description}
            </p>

            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-5 flex-wrap">
              {showAdmin && (guide as any).internal_code && (
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{(guide as any).internal_code}</span>
              )}
              {guide.author_name && (
                <span className="font-medium">{guide.author_name}</span>
              )}
              {updatedDate && (
                <>
                  <span>·</span>
                  <span>{updatedDate}</span>
                </>
              )}
            </div>

            {showAdmin ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onEdit(guide); }}>
                  <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onTogglePublished(guide); }}>
                  {guide.is_published ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                  {guide.is_published ? "Despublicar" : "Publicar"}
                </Button>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onToggleFeatured(guide); }}>
                  <StarOff className="h-3.5 w-3.5 mr-1" /> Remover destaque
                </Button>
                <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(guide); }}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                </Button>
              </div>
            ) : (
              <Button
                className="w-fit"
                onClick={(e) => { e.stopPropagation(); navigate(`/guias/${guide.slug}`); }}
              >
                Ler guia
              </Button>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}
