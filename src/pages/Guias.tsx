import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { PageHero } from "@/components/layout/PageHero";
import { GlobalSeo } from "@/components/seo/GlobalSeo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, BookOpen } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useGuides, Guide, useGuidesMutations } from "@/hooks/useGuides";
import { GuideModal } from "@/components/admin/GuideModal";
import { FeaturedGuideCard } from "@/components/guides/FeaturedGuideCard";
import { GuideListItem } from "@/components/guides/GuideListItem";

const FALLBACK_TITLE = "Guias | PqEstudar";
const FALLBACK_DESCRIPTION = "Conteúdos práticos e evergreen para estudar com mais clareza e aproveitar oportunidades.";

export default function Guias() {
  const { isAdmin } = useUserRoles();
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editGuide, setEditGuide] = useState<Guide | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Guide | null>(null);

  const showAdmin = isAdmin && isManagementMode;
  const { data: guides, isLoading } = useGuides(showAdmin);
  const { createGuide, updateGuide, deleteGuide, togglePublished, toggleFeatured } = useGuidesMutations();

  const categories = useMemo(() => {
    if (!guides) return [];
    return [...new Set(guides.map(g => g.category))].sort();
  }, [guides]);

  const filtered = useMemo(() => {
    if (!guides) return [];
    let list = guides;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter(g => g.title.toLowerCase().includes(lower));
    }
    if (categoryFilter !== "all") {
      list = list.filter(g => g.category === categoryFilter);
    }
    return list;
  }, [guides, searchTerm, categoryFilter]);

  // Determine featured guide and remaining list
  const { featuredGuide, listGuides } = useMemo(() => {
    if (!filtered || filtered.length === 0) return { featuredGuide: null, listGuides: [] };

    // Find featured: is_featured=true, lowest sort_order, then newest updated_at
    const featuredCandidates = filtered
      .filter(g => g.is_featured)
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

    let featured: Guide | null = featuredCandidates[0] || null;

    // Fallback: most recent published
    if (!featured) {
      const sorted = [...filtered].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      featured = sorted[0] || null;
    }

    const rest = featured ? filtered.filter(g => g.id !== featured!.id) : filtered;

    // Sort rest: sort_order ASC, then updated_at DESC
    const sortedRest = [...rest].sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return { featuredGuide: featured, listGuides: sortedRest };
  }, [filtered]);

  const handleSave = async (data: Partial<Guide>) => {
    if (data.id) {
      await updateGuide.mutateAsync(data as any);
    } else {
      await createGuide.mutateAsync(data);
    }
  };

  const handleEdit = (guide: Guide) => {
    setEditGuide(guide);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditGuide(null);
    setModalOpen(true);
  };

  const adminActions = {
    onEdit: handleEdit,
    onDelete: (guide: Guide) => setDeleteTarget(guide),
    onTogglePublished: (guide: Guide) =>
      togglePublished.mutate({ id: guide.id, is_published: !guide.is_published }),
    onToggleFeatured: (guide: Guide) =>
      toggleFeatured.mutate({ id: guide.id, is_featured: !guide.is_featured }),
  };

  return (
    <>
      <GlobalSeo />
      <Helmet>
        <title>{FALLBACK_TITLE}</title>
        <meta name="description" content={FALLBACK_DESCRIPTION} />
      </Helmet>

      <PageHero
        title="Guias"
        description="Conteúdos práticos e evergreen para estudar com mais clareza e aproveitar oportunidades."
      />

      <div className="container mx-auto px-6 pt-12 md:pt-16 pb-16">
        {/* Admin toggle */}
        {isAdmin && (
          <div className="flex items-center gap-3 mb-6">
            <Switch
              checked={isManagementMode}
              onCheckedChange={setIsManagementMode}
              id="guide-mgmt"
            />
            <Label htmlFor="guide-mgmt" className="text-sm">
              Modo de Gerenciamento
            </Label>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar guia..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showAdmin && (
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" /> Novo guia
            </Button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-[1.2rem]" />
            <Skeleton className="h-24 rounded-[1.2rem]" />
            <Skeleton className="h-24 rounded-[1.2rem]" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">
              {searchTerm || categoryFilter !== "all"
                ? "Nenhum guia encontrado com esses filtros."
                : "Nenhum guia disponível no momento."}
            </p>
          </div>
        )}

        {/* Featured + List */}
        {!isLoading && filtered.length > 0 && (
          <>
            {featuredGuide && (
              <FeaturedGuideCard
                guide={featuredGuide}
                showAdmin={showAdmin}
                {...adminActions}
              />
            )}

            {listGuides.length > 0 && (
              <div className="space-y-4">
                {listGuides.map(guide => (
                  <GuideListItem
                    key={guide.id}
                    guide={guide}
                    showAdmin={showAdmin}
                    {...adminActions}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <GuideModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditGuide(null); }}
        onSave={handleSave}
        guide={editGuide}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir guia</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteGuide.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
