import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Plus, Edit, Eye, EyeOff, Trash2, GripVertical, CheckCircle, History, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureRequests, FeatureRequest } from '@/hooks/useFeatureRequests';
import { toast } from '@/hooks/use-toast';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* ─── Sortable Card ─── */
function SortableFeatureCard({
  feature, isAdmin, isManagement, onVote, onUnvote, onEdit, onToggle, onDelete, onComplete,
}: {
  feature: FeatureRequest;
  isAdmin: boolean;
  isManagement: boolean;
  onVote: (id: string) => void;
  onUnvote: (id: string) => void;
  onEdit: (f: FeatureRequest) => void;
  onToggle: (f: FeatureRequest) => void;
  onDelete: (f: FeatureRequest) => void;
  onComplete: (f: FeatureRequest) => void;
}) {
  const { user } = useAuth();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: feature.id,
    disabled: !isManagement,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-3">
          {isManagement && (
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(feature)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onToggle(feature)}>
                {feature.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onComplete(feature)}>
                <CheckCircle className="w-4 h-4 text-primary" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => onDelete(feature)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-start gap-3">
            <CardTitle className="text-lg leading-tight flex items-center gap-2">
              {feature.title}
              {isManagement && !feature.is_visible && (
                <Badge variant="secondary" className="text-xs">Oculta</Badge>
              )}
            </CardTitle>
          </div>
          {feature.description && (
            <CardDescription className="text-sm mt-1">{feature.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span className="font-semibold text-foreground">{feature.votes_count}</span>
              <span>voto{feature.votes_count !== 1 ? 's' : ''}</span>
            </div>
            {user ? (
              <Button
                variant={feature.user_voted ? 'default' : 'outline'}
                size="sm"
                onClick={() => feature.user_voted ? onUnvote(feature.id) : onVote(feature.id)}
                className="gap-2"
              >
                <ThumbsUp className={`h-4 w-4 ${feature.user_voted ? 'fill-current' : ''}`} />
                {feature.user_voted ? 'Votado' : 'Votar'}
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => toast({ title: 'Faça login para votar' })}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Votar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Votacoes() {
  const { isAdmin, loading: loadingRoles } = useUserRoles();
  const [isManagement, setIsManagement] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FeatureRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeatureRequest | null>(null);
  const [completeTarget, setCompleteTarget] = useState<FeatureRequest | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const effectiveAdmin = isAdmin;
  const includeHidden = isManagement && effectiveAdmin;

  const {
    features, loading, vote, unvote, create, update, toggleVisible, remove, complete, reorder,
  } = useFeatureRequests(includeHidden);

  const openFeatures = features.filter(f => f.status === 'open');
  const completedFeatures = features.filter(f => f.status === 'completed');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = openFeatures.findIndex(f => f.id === active.id);
    const newIndex = openFeatures.findIndex(f => f.id === over.id);
    const reordered = arrayMove(openFeatures, oldIndex, newIndex);
    const updates = reordered.map((f, i) => ({ id: f.id, sort_order: i }));
    reorder(updates);
  };

  const openModal = (feature?: FeatureRequest) => {
    if (feature) {
      setEditing(feature);
      setFormTitle(feature.title);
      setFormDesc(feature.description || '');
    } else {
      setEditing(null);
      setFormTitle('');
      setFormDesc('');
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;
    if (editing) {
      update({ id: editing.id, title: formTitle, description: formDesc });
    } else {
      create({ title: formTitle, description: formDesc });
    }
    setModalOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Votações – PqEstudar</title>
        <meta name="description" content="Vote nos próximos lançamentos e ajude a definir o futuro do PqEstudar." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Próximos{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Lançamentos
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Vote nas funcionalidades que você mais quer ver no PqEstudar.
          </p>
        </div>

        {/* Admin toggle */}
        {effectiveAdmin && !loadingRoles && (
          <div className="flex items-center justify-between mb-6 p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <Switch
                id="management-mode"
                checked={isManagement}
                onCheckedChange={setIsManagement}
              />
              <Label htmlFor="management-mode" className="cursor-pointer font-medium">
                Modo de Gerenciamento
              </Label>
            </div>
            {isManagement && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => openModal()}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
                <Button
                  size="sm"
                  variant={showHistory ? 'default' : 'outline'}
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="h-4 w-4 mr-1" /> Histórico
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : openFeatures.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum lançamento em votação no momento.</p>
          </div>
        ) : (
          /* Feature cards */
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={openFeatures.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {openFeatures.map(feature => (
                    <motion.div
                      key={feature.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <SortableFeatureCard
                        feature={feature}
                        isAdmin={effectiveAdmin}
                        isManagement={isManagement}
                        onVote={vote}
                        onUnvote={unvote}
                        onEdit={openModal}
                        onToggle={f => toggleVisible({ id: f.id, is_visible: f.is_visible })}
                        onDelete={setDeleteTarget}
                        onComplete={setCompleteTarget}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* History (admin only) */}
        {isManagement && showHistory && completedFeatures.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Concluídos
            </h2>
            <div className="grid gap-3">
              {completedFeatures.map(f => (
                <Card key={f.id} className="opacity-75">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base line-through">{f.title}</CardTitle>
                    {f.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Concluído em {new Date(f.completed_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Título" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
            <Textarea placeholder="Descrição (opcional)" value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formTitle.trim()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteTarget) remove(deleteTarget.id); setDeleteTarget(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete confirm */}
      <AlertDialog open={!!completeTarget} onOpenChange={() => setCompleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como concluído?</AlertDialogTitle>
            <AlertDialogDescription>
              "{completeTarget?.title}" será marcado como concluído e uma notificação será enviada a todos os usuários.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (completeTarget) complete(completeTarget.id); setCompleteTarget(null); }}>
              Concluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
