import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { PageHero } from "@/components/layout/PageHero";
import { GlobalSeo } from "@/components/seo/GlobalSeo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

function GuidesList({
  guides,
  showAdmin,
  adminActions,
  showFeatured,
}: {
  guides: Guide[];
  showAdmin: boolean;
  adminActions: Record<string, (g: Guide) => void>;
  showFeatured: boolean;
}) {
  const { featuredGuide, listGuides } = useMemo(() => {
    if (!guides.length) return { featuredGuide: null, listGuides: [] as Guide[] };

    if (!showFeatured) {
      const sorted = [...guides].sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      return { featuredGuide: null, listGuides: sorted };
    }

    const featuredCandidates = guides
      .filter((g) => g.is_featured)
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

    const featured =
      featuredCandidates[0] ??
      [...guides].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )[0] ??
      null;

    const rest = guides
      .filter((g) => g.id !== featured?.id)
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

    return { featuredGuide: featured, listGuides: rest };
  }, [guides, showFeatured]);

  if (guides.length === 0) {
    return (
      <div className="py-16 text-center">
        <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg text-muted-foreground">Nenhum guia encontrado.</p>
      </div>
    );
  }

  return (
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
  );
}

export default function Guias() {
  const ps = usePageSettings("/guias");
  const { isAdmin } = useUserRoles();
  const [isManagementMode, setIsManagementMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [adminTab, setAdminTab] = useState<"published" | "drafts">("published");
  const [modalOpen, setModalOpen] = useState(false);
  const [editGuide, setEditGuide] = useState<Guide | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Guide | null>(null);

  const showAdmin = isAdmin && isManagementMode;
  const { data: guides, isLoading } = useGuides(showAdmin);
  const { createGuide, updateGuide, deleteGuide, togglePublished, toggleFeatured } = useGuidesMutations();

  // Total counts per status (unfiltered) for tab badges
  const publishedCount = useMemo(() => guides?.filter((g) => g.is_published).length ?? 0, [guides]);
  const draftsCount = useMemo(() => guides?.filter((g) => !g.is_published).length ?? 0, [guides]);

  const categories = useMemo(() => {
    if (!guides) return [];
    return [...new Set(guides.map((g) => g.category))].sort();
  }, [guides]);

  // Apply status filter (admin tabs), then search + category
  const filtered = useMemo(() => {
    if (!guides) return [];
    let list = guides;

    // In admin mode, filter by tab status
    if (showAdmin) {
      list = list.filter((g) =>
        adminTab === "published" ? g.is_published : !g.is_published
      );
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter((g) => g.title.toLowerCase().includes(lower));
    }

    if (categoryFilter !== "all") {
      list = list.filter((g) => g.category === categoryFilter);
    }

    return list;
  }, [guides, showAdmin, adminTab, searchTerm, categoryFilter]);

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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[1.2rem]" />
          <Skeleton className="h-24 rounded-[1.2rem]" />
          <Skeleton className="h-24 rounded-[1.2rem]" />
        </div>
      );
    }

    return (
      <GuidesList
        guides={filtered}
        showAdmin={showAdmin}
        adminActions={adminActions}
        showFeatured={!showAdmin || adminTab === "published"}
      />
    );
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

        {showAdmin ? (
          <Tabs value={adminTab} onValueChange={(v) => setAdminTab(v as "published" | "drafts")}>
            <TabsList className="mb-6">
              <TabsTrigger value="published">
                Publicados ({publishedCount})
              </TabsTrigger>
              <TabsTrigger value="drafts">
                Rascunhos ({draftsCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="published">{renderContent()}</TabsContent>
            <TabsContent value="drafts">{renderContent()}</TabsContent>
          </Tabs>
        ) : (
          renderContent()
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