import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PageHero } from "@/components/layout/PageHero";
import { GlobalSeo } from "@/components/seo/GlobalSeo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  BookOpen,
} from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useGuides, Guide, useGuidesMutations } from "@/hooks/useGuides";
import { GuideModal } from "@/components/admin/GuideModal";

const FALLBACK_TITLE = "Guias | PqEstudar";
const FALLBACK_DESCRIPTION = "Conteúdos práticos e evergreen para estudar com mais clareza e aproveitar oportunidades.";

const CATEGORY_COLORS: Record<string, string> = {
  Concursos: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Ferramentas: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Oportunidades: "bg-green-500/10 text-green-600 border-green-500/20",
  Produtividade: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Carreira: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export default function Guias() {
  const navigate = useNavigate();
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

  return (
    <>
      <GlobalSeo pageType="ItemList" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 rounded-[1.2rem]" />
            ))}
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

        {/* Grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filtered.map(guide => (
              <Card
                key={guide.id}
                className="flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => !showAdmin && navigate(`/guias/${guide.slug}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge
                      variant="outline"
                      className={CATEGORY_COLORS[guide.category] || ""}
                    >
                      {guide.category}
                    </Badge>
                    {guide.is_featured && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20" variant="outline">
                        <Star className="h-3 w-3 mr-1" /> Destaque
                      </Badge>
                    )}
                    {showAdmin && !guide.is_published && (
                      <Badge variant="secondary">Rascunho</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight">{guide.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {guide.short_description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col mt-auto pt-0">
                  {showAdmin ? (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleEdit(guide); }}>
                        <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePublished.mutate({ id: guide.id, is_published: !guide.is_published });
                        }}
                      >
                        {guide.is_published ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                        {guide.is_published ? "Despublicar" : "Publicar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFeatured.mutate({ id: guide.id, is_featured: !guide.is_featured });
                        }}
                      >
                        {guide.is_featured ? <StarOff className="h-3.5 w-3.5 mr-1" /> : <Star className="h-3.5 w-3.5 mr-1" />}
                        {guide.is_featured ? "Remover destaque" : "Destacar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(guide); }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={(e) => { e.stopPropagation(); navigate(`/guias/${guide.slug}`); }}
                    >
                      Ler guia
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
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
