import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { X, Sparkles, Brain, Shield, GraduationCap, Wrench, Zap, Plus, Edit, Eye, EyeOff, Trash2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useTools, Tool } from "@/hooks/useTools";
import { ToolModal } from "@/components/admin/ToolModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Categorias disponíveis
const CATEGORIES = [
  "Inteligência Artificial",
  "Produtividade",
  "Segurança e Privacidade",
  "Cursos Gratuitos",
  "Utilidades",
];

// Ícones padrão para categorias
const CATEGORY_ICONS: Record<string, any> = {
  "Inteligência Artificial": Brain,
  "Produtividade": Zap,
  "Segurança e Privacidade": Shield,
  "Cursos Gratuitos": GraduationCap,
  "Utilidades": Wrench,
};

// Componente de card sortable
function SortableToolCard({ 
  tool, 
  isManagementMode,
  handleEdit, 
  toggleVisible, 
  setDeleteTool 
}: { 
  tool: Tool; 
  isManagementMode: boolean; 
  handleEdit: (t: Tool) => void; 
  toggleVisible: (id: string, state: boolean) => void; 
  setDeleteTool: (t: Tool) => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tool.id, disabled: !isManagementMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = tool.tags[0] ? CATEGORY_ICONS[tool.tags[0]] || Sparkles : Sparkles;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          {isManagementMode && (
            <div 
              className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid="admin-actions"
            >
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
                aria-label="Arrastar para reordenar"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleEdit(tool)}
                aria-label="Editar ferramenta"
                data-evt="admin_edit"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => toggleVisible(tool.id, tool.is_visible)}
                aria-label={tool.is_visible ? "Ocultar ferramenta" : "Exibir ferramenta"}
                data-evt={tool.is_visible ? "admin_hide" : "admin_show"}
              >
                {tool.is_visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => setDeleteTool(tool)}
                aria-label="Excluir ferramenta"
                data-evt="admin_delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex items-start gap-4 mb-2">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Icon className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl flex items-center gap-2">
                {tool.name}
                {isManagementMode && !tool.is_visible && (
                  <Badge variant="secondary" className="text-xs">
                    Oculta
                  </Badge>
                )}
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-sm leading-relaxed">
            {tool.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {tool.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
          {tool.url && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(tool.url, '_blank')}
            >
              Acessar
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Ferramentas() {
  // EXATAMENTE o mesmo hook usado em /parceiros
  const { isAdmin, loading: loadingRoles } = useUserRoles();
  
  // Debug flag (apenas em dev)
  const isDev = process.env.NODE_ENV === 'development';
  const [forceAdmin, setForceAdmin] = useState(false);
  
  useEffect(() => {
    if (isDev) {
      const debugParam = new URLSearchParams(window.location.search).get('adminPreview') === '1';
      const debugStorage = localStorage.getItem('forceAdmin') === '1';
      setForceAdmin(debugParam || debugStorage);
    }
  }, [isDev]);
  
  const effectiveAdmin = isAdmin || forceAdmin;

  const [isManagementMode, setIsManagementMode] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [deleteTool, setDeleteTool] = useState<Tool | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);

  const { tools, loading, addTool, updateTool, deleteTool: removeTool, toggleVisible, reorderTools } = useTools(isManagementMode);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtragem combinada
  let displayedTools = tools;

  // Filtro por tags selecionadas (modo público)
  if (!isManagementMode && selectedTags.length > 0) {
    displayedTools = displayedTools.filter((tool) =>
      tool.tags.some((tag) => selectedTags.includes(tag))
    );
  }

  // Filtro por categoria dropdown (modo admin)
  if (isManagementMode && categoryFilter !== "all") {
    displayedTools = displayedTools.filter((tool) =>
      tool.tags.includes(categoryFilter)
    );
  }

  const availableTags = CATEGORIES.filter((tag) => !selectedTags.includes(tag));

  const handleSelectTag = (tag: string) => {
    setSelectedTags((prev) => [...prev, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleClearAll = () => {
    setSelectedTags([]);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    action: () => void
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  const handleAddTool = () => {
    setEditingTool(null);
    setModalOpen(true);
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setModalOpen(true);
  };

  const handleSaveTool = async (toolData: Partial<Tool>) => {
    if (editingTool) {
      await updateTool(editingTool.id, toolData);
    } else {
      await addTool(toolData as Omit<Tool, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'sort_order'>);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTool) {
      await removeTool(deleteTool.id);
      setDeleteTool(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = displayedTools.findIndex((t) => t.id === active.id);
      const newIndex = displayedTools.findIndex((t) => t.id === over.id);

      const reordered = arrayMove(displayedTools, oldIndex, newIndex);
      setHasUnsavedOrder(true);
      
      // Atualizar ordem temporariamente para visualização
      // A ordem real será salva quando clicar em "Salvar ordem"
    }
  };

  const handleSaveOrder = async () => {
    await reorderTools(displayedTools);
    setHasUnsavedOrder(false);
  };

  const activeTool = activeId ? tools.find((t) => t.id === activeId) : null;

  return (
    <>
      <Helmet>
        <title>O Arsenal de Ferramentas Secretas — PqEstudar</title>
        <meta
          name="description"
          content="A curadoria completa das ferramentas e hacks que viralizaram. Explore por categoria e acelere seus resultados."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4"
                  >
                    O Arsenal de Ferramentas Secretas.
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-lg sm:text-xl text-muted-foreground"
                  >
                    A curadoria completa das ferramentas e hacks que viralizaram.
                    Explore por categoria e acelere seus resultados.
                  </motion.p>
                </div>

                {/* Switch de Gerenciamento (apenas admin) - Skeleton durante loading */}
                {loadingRoles ? (
                  <div className="flex items-center gap-3 ml-6">
                    <Skeleton className="h-6 w-12 rounded-full" />
                    <Skeleton className="h-4 w-40 rounded" />
                  </div>
                ) : effectiveAdmin ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex items-center gap-3 ml-6"
                  >
                    <Switch
                      id="management-mode"
                      checked={isManagementMode}
                      onCheckedChange={setIsManagementMode}
                      data-testid="admin-toggle"
                    />
                    <Label htmlFor="management-mode" className="cursor-pointer whitespace-nowrap flex items-center gap-2">
                      Modo de Gerenciamento
                      {forceAdmin && isDev && (
                        <Badge variant="secondary" className="text-xs">
                          Admin ON
                        </Badge>
                      )}
                    </Label>
                  </motion.div>
                ) : null}
              </div>
            </div>
          </section>

          {/* Controles Admin */}
          {isManagementMode && (
            <section className="pb-6 px-4 sm:px-6 lg:px-8">
              <div className="container max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <Button onClick={handleAddTool} size="sm" data-evt="admin_add">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Ferramenta
                  </Button>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Badge variant="secondary" className="ml-auto">
                    {displayedTools.length} ferramenta(s)
                  </Badge>

                  {hasUnsavedOrder && (
                    <Button
                      onClick={handleSaveOrder}
                      variant="default"
                      size="sm"
                      data-evt="admin_reorder"
                    >
                      Salvar ordem
                    </Button>
                  )}
                </motion.div>
              </div>
            </section>
          )}

          {/* Filtros (modo público) */}
          {!isManagementMode && (
            <section className="pb-12 px-4 sm:px-6 lg:px-8">
              <div className="container max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-semibold text-foreground mb-6">
                    Categorias
                  </h2>

                  {/* Caixa de Seleção */}
                  <div
                    className="mb-6 p-4 rounded-lg border-2 border-dashed border-border bg-muted/20 min-h-[80px] flex flex-wrap gap-2 items-start"
                    role="list"
                    aria-label="Categorias selecionadas"
                  >
                    {selectedTags.length === 0 ? (
                      <p className="text-muted-foreground text-sm self-center">
                        Selecione uma ou mais categorias…
                      </p>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {selectedTags.map((tag) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            role="listitem"
                          >
                            <Badge
                              variant="secondary"
                              className="px-3 py-2 text-sm font-semibold rounded-2xl cursor-pointer hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center gap-2"
                              tabIndex={0}
                              onClick={() => handleRemoveTag(tag)}
                              onKeyDown={(e) =>
                                handleKeyDown(e, () => handleRemoveTag(tag))
                              }
                              aria-label={`Remover filtro ${tag}`}
                              data-evt="tag_remove"
                            >
                              {tag}
                              <X className="w-3 h-3" aria-hidden="true" />
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Pool de Tags */}
                  <div
                    className="flex flex-wrap gap-2 mb-4"
                    role="list"
                    aria-label="Categorias disponíveis"
                  >
                    <AnimatePresence mode="popLayout">
                      {availableTags.map((tag) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          role="listitem"
                        >
                          <Badge
                            variant="outline"
                            className="px-3 py-2 text-sm font-semibold rounded-2xl cursor-pointer hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            tabIndex={0}
                            onClick={() => handleSelectTag(tag)}
                            onKeyDown={(e) =>
                              handleKeyDown(e, () => handleSelectTag(tag))
                            }
                            aria-label={`Adicionar filtro ${tag}`}
                            data-evt="tag_select"
                          >
                            {tag}
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Botão Limpar Tudo */}
                  {selectedTags.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="text-muted-foreground hover:text-foreground"
                        data-evt="clear_all"
                      >
                        Limpar tudo
                      </Button>
                    </motion.div>
                  )}

                  {/* Contador de Resultados */}
                  <p
                    className="text-sm text-muted-foreground mt-4"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {displayedTools.length === tools.length
                      ? `Mostrando todas as ${tools.length} ferramentas`
                      : `Mostrando ${displayedTools.length} de ${tools.length} ferramentas`}
                  </p>
                </motion.div>
              </div>
            </section>
          )}

          {/* Grid de Ferramentas */}
          <section className="pb-24 px-4 sm:px-6 lg:px-8">
            <div className="container max-w-7xl mx-auto">
              {loading ? (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">Carregando...</p>
                </div>
              ) : displayedTools.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-16"
                >
                  <p className="text-lg text-muted-foreground mb-4">
                    {selectedTags.length > 0
                      ? "Nenhuma ferramenta encontrada com os filtros selecionados."
                      : "Nenhuma ferramenta disponível."}
                  </p>
                  {selectedTags.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleClearAll}
                      data-evt="clear_all"
                    >
                      Limpar filtros
                    </Button>
                  )}
                </motion.div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={displayedTools.map((t) => t.id)}
                    strategy={rectSortingStrategy}
                  >
                    <motion.div
                      layout
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {displayedTools.map((tool) => (
                        <SortableToolCard
                          key={tool.id}
                          tool={tool}
                          isManagementMode={isManagementMode}
                          handleEdit={handleEdit}
                          toggleVisible={toggleVisible}
                          setDeleteTool={setDeleteTool}
                        />
                      ))}
                    </motion.div>
                  </SortableContext>

                  <DragOverlay>
                    {activeTool ? (
                      <Card className="opacity-80">
                        <CardHeader>
                          <CardTitle>{activeTool.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* Modais */}
      <ToolModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTool}
        tool={editingTool}
        availableTags={CATEGORIES}
      />

      <AlertDialog open={!!deleteTool} onOpenChange={() => setDeleteTool(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a ferramenta "{deleteTool?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
