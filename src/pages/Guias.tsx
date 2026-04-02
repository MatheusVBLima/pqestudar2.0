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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, BookOpen, ChevronDown } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useGuides, Guide, useGuidesMutations } from "@/hooks/useGuides";
import { usePageSettings } from "@/hooks/usePageSettings";
import { GuideModal } from "@/components/admin/GuideModal";
import { FeaturedGuideCard } from "@/components/guides/FeaturedGuideCard";
import { GuideListItem } from "@/components/guides/GuideListItem";

const FALLBACK_TITLE = "Guias | PqEstudar";
const FALLBACK_DESCRIPTION = "Conteúdos práticos e evergreen para estudar com mais clareza e aproveitar oportunidades.";

export default function Guias() {
  const ps = usePageSettings("/guias");
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
    return [...new Set(guides.map((g) => g.category))].sort();
  }, [guides]);

  const filtered = useMemo(() => {
    if (!guides) return [];
    let list = guides;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter((g) => g.title.toLowerCase().includes(lower));
    }

    if (categoryFilter !== "all") {
      list = list.filter((g) => g.category === categoryFilter);
    }

    return list;
  }, [guides, searchTerm, categoryFilter]);

  const { featuredGuide, listGuides } = useMemo(() => {
    if (!filtered.length) {
      return { featuredGuide: null, listGuides: [] as Guide[] };
    }

    const featuredCandidates = filtered
      .filter((g) => g.is_featured)
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

    const featured =
      featuredCandidates[0] ??
      [...filtered].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )[0] ??
      null;

    const listGuides = filtered
      .filter((g) => g.id !== featured?.id)
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

    return { featuredGuide: featured, listGuides };
  }, [filtered]);

  const handleSave = async (data: Partial<Guide>) => {
    if (data.id) {
      await updateGuide.mutateAsync(data as Partial<Guide> & { id: string });
      return;
    }

    await createGuide.mutateAsync(data);
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
        <title>{ps.titleTag || FALLBACK_TITLE}</title>
        <meta name="description" content={ps.metaDescription || FALLBACK_DESCRIPTION} />
      </Helmet>

      <PageHero
        title={ps.headerTitle || "Guias"}
        description={ps.headerDescription || "Conteúdos práticos e evergreen para estudar com mais clareza e aproveitar oportunidades."}
      />

      <div className="container mx-auto px-6 pt-12 md:pt-16 pb-16">
        {isAdmin && (
          <div className="mb-6 flex items-center gap-3">
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

        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-start">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar guia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative w-full shrink-0 lg:w-[220px]">
            <select
              aria-label="Filtrar por categoria"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 w-full appearance-none rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">Todas categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {showAdmin && (
            <Button onClick={handleNew} className="w-full lg:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Novo guia
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-[1.2rem]" />
            <Skeleton className="h-24 rounded-[1.2rem]" />
            <Skeleton className="h-24 rounded-[1.2rem]" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground">
              {searchTerm || categoryFilter !== "all"
                ? "Nenhum guia encontrado com esses filtros."
                : "Nenhum guia disponível no momento."}
            </p>
          </div>
        )}

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
                {listGuides.map((guide) => (
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

      <GuideModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditGuide(null);
        }}
        onSave={handleSave}
        guide={editGuide}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
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
                if (!deleteTarget) return;
                deleteGuide.mutate(deleteTarget.id);
                setDeleteTarget(null);
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
