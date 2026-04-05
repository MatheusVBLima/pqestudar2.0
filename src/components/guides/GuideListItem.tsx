import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface GuideListItemProps {
  guide: Guide;
  showAdmin: boolean;
  onEdit: (guide: Guide) => void;
  onDelete: (guide: Guide) => void;
  onTogglePublished: (guide: Guide) => void;
  onToggleFeatured: (guide: Guide) => void;
}

export function GuideListItem({
  guide,
  showAdmin,
  onEdit,
  onDelete,
  onTogglePublished,
  onToggleFeatured,
}: GuideListItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!showAdmin) navigate(`/guias/${guide.slug}`);
  };

  const updatedDate = guide.updated_at
    ? format(new Date(guide.updated_at), "d 'de' MMM, yyyy", { locale: ptBR })
    : null;

  return (
    <article
      className="flex gap-4 sm:gap-5 p-4 rounded-[1.2rem] border border-border/50 bg-card hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 sm:w-28 sm:h-24 shrink-0 rounded-lg bg-accent flex items-center justify-center overflow-hidden">
        {(guide as any).cover_image_url ? (
          <img
            src={(guide as any).cover_image_url}
            alt={guide.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <BookOpen className="h-7 w-7 text-primary/40" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <Badge
            variant="outline"
            className={`text-[11px] ${CATEGORY_COLORS[guide.category] || ""}`}
          >
            {guide.category}
          </Badge>
          {guide.is_featured && (
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[11px]" variant="outline">
              <Star className="h-3 w-3 mr-0.5" /> Destaque
            </Badge>
          )}
          {showAdmin && !guide.is_published && (
            <Badge variant="secondary" className="text-[11px]">Rascunho</Badge>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-semibold leading-snug line-clamp-2 mb-1">
          {guide.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 hidden sm:block">
          {guide.short_description}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto flex-wrap">
          {showAdmin && (guide as any).internal_code && (
            <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">{(guide as any).internal_code}</span>
          )}
          {guide.author_name && <span>{guide.author_name}</span>}
          {updatedDate && (
            <>
              <span>·</span>
              <span>{updatedDate}</span>
            </>
          )}
        </div>

        {showAdmin && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onEdit(guide); }}>
              <Edit className="h-3.5 w-3.5 mr-1" /> Editar
            </Button>
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onTogglePublished(guide); }}>
              {guide.is_published ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
              {guide.is_published ? "Despublicar" : "Publicar"}
            </Button>
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onToggleFeatured(guide); }}>
              {guide.is_featured ? <StarOff className="h-3.5 w-3.5 mr-1" /> : <Star className="h-3.5 w-3.5 mr-1" />}
              {guide.is_featured ? "Remover destaque" : "Destacar"}
            </Button>
            <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(guide); }}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
            </Button>
          </div>
        )}
      </div>

      {/* Read CTA - desktop only, non-admin */}
      {!showAdmin && (
        <div className="hidden sm:flex items-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/guias/${guide.slug}`); }}
          >
            Ler guia
          </Button>
        </div>
      )}
    </article>
  );
}
