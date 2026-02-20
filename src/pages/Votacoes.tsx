import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import {
  ThumbsUp, Plus, Edit, Eye, EyeOff, Trash2, GripVertical,
  CheckCircle, History, Sparkles, Upload, Link as LinkIcon, X, ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { usePageSettings } from '@/hooks/usePageSettings';
import { supabase } from '@/integrations/supabase/client';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* ─── Vitrine Card ─── */
function SortableFeatureCard({
  feature, rank, isAdmin, isManagement, onVote, onUnvote, onEdit, onToggle, onDelete, onComplete,
}: {
  feature: FeatureRequest;
  rank: number;
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

  // Deterministic gradient fallback
  const hue = feature.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const gradientStyle = {
    background: `linear-gradient(135deg, hsl(${hue} 40% 20%), hsl(${(hue + 60) % 360} 50% 35%))`,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group h-full">
      <div
        className="rounded-[1.2rem] border border-border bg-card flex flex-col h-full overflow-hidden
          transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      >
        {/* Cover area */}
        <div className="relative" style={{ aspectRatio: '16/9' }}>
          {feature.card_image_url ? (
            <img
              src={feature.card_image_url}
              alt={feature.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover rounded-t-[1.2rem]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute('hidden');
              }}
            />
          ) : null}
          {/* Gradient fallback (always rendered, hidden behind image if image loads) */}
          <div
            className="absolute inset-0 rounded-t-[1.2rem]"
            style={gradientStyle}
            hidden={!!feature.card_image_url}
          />

          {/* Rank badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm
              border border-border text-foreground text-xs font-bold px-2.5 py-1 shadow-sm">
              #{rank}
            </span>
          </div>

          {/* Vote counter overlay */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-sm
              border border-border text-foreground text-xs font-semibold px-2.5 py-1 shadow-sm">
              <ThumbsUp className="h-3 w-3" />
              {feature.votes_count}
            </span>
          </div>

          {/* Admin controls overlay */}
          {isManagement && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div {...attributes} {...listeners}
                className="cursor-grab active:cursor-grabbing p-1.5 bg-background/80 backdrop-blur-sm rounded-full hover:bg-accent">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm rounded-full hover:bg-accent" onClick={() => onEdit(feature)}>
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm rounded-full hover:bg-accent" onClick={() => onToggle(feature)}>
                {feature.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm rounded-full hover:bg-accent" onClick={() => onComplete(feature)}>
                <CheckCircle className="w-3.5 h-3.5 text-primary" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm rounded-full hover:bg-accent text-destructive hover:text-destructive" onClick={() => onDelete(feature)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* Hidden badge for admin */}
          {isManagement && !feature.is_visible && (
            <div className="absolute bottom-3 left-3 z-10">
              <Badge variant="secondary" className="text-xs">Oculta</Badge>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground mb-1.5">
              {feature.title}
            </h3>
            {feature.description && (
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {feature.description}
              </p>
            )}
          </div>

          {/* CTA */}
          {user ? (
            <Button
              variant={feature.user_voted ? 'default' : 'outline'}
              size="sm"
              onClick={() => feature.user_voted ? onUnvote(feature.id) : onVote(feature.id)}
              className="w-full rounded-[1.2rem] gap-2 text-sm"
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${feature.user_voted ? 'fill-current' : ''}`} />
              {feature.user_voted ? 'Votado ✓' : 'Votar'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast({ title: 'Faça login para votar' })}
              className="w-full rounded-[1.2rem] gap-2 text-sm"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Votar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Image Field (Upload | URL) ─── */
function ImageField({
  imageUrl,
  onImageUrl,
}: {
  imageUrl: string;
  onImageUrl: (url: string) => void;
}) {
  const [source, setSource] = useState<'upload' | 'url'>('url');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [urlError, setUrlError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToStorage = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const fileName = `vote-${crypto.randomUUID()}-${timestamp}.${ext}`;

    const { error } = await supabase.storage
      .from('vote-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('vote-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleFile = async (file: File) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast({ title: 'Formato não suportado. Use PNG, JPG ou WEBP.', variant: 'destructive' });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: 'Imagem muito grande. Máximo 3MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToStorage(file);
      onImageUrl(url);
    } catch {
      toast({ title: 'Erro ao fazer upload da imagem.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5" />
        Imagem do Card
        <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
      </Label>

      <Tabs value={source} onValueChange={(v) => setSource(v as 'upload' | 'url')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload"><Upload className="w-3.5 h-3.5 mr-1.5" />Upload</TabsTrigger>
          <TabsTrigger value="url"><LinkIcon className="w-3.5 h-3.5 mr-1.5" />URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-2">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-[1.2rem] p-5 text-center transition-colors cursor-pointer ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <p className="text-sm text-muted-foreground">Enviando…</p>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Arraste ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP • Máx 3MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-2">
          <Input
            type="url"
            placeholder="https://exemplo.com/imagem.jpg"
            value={imageUrl.startsWith('http') ? imageUrl : ''}
            onChange={(e) => {
              const v = e.target.value;
              setUrlError('');
              if (v && !v.startsWith('http')) {
                setUrlError('URL deve começar com http:// ou https://');
              }
              onImageUrl(v);
            }}
          />
          {urlError && <p className="text-xs text-destructive mt-1">{urlError}</p>}
        </TabsContent>
      </Tabs>

      {/* Preview + remove */}
      {imageUrl && (
        <div className="relative rounded-[1.2rem] overflow-hidden border border-border" style={{ aspectRatio: '16/9' }}>
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full"
            onClick={() => onImageUrl('')}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function Votacoes() {
  const ps = usePageSettings("/votacoes");
  const { isAdmin, loading: loadingRoles } = useUserRoles();
  const [isManagement, setIsManagement] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FeatureRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeatureRequest | null>(null);
  const [completeTarget, setCompleteTarget] = useState<FeatureRequest | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  const effectiveAdmin = isAdmin;
  const includeHidden = isManagement && effectiveAdmin;

  const {
    features, loading, vote, unvote, create, update, toggleVisible, remove, complete, reorder,
  } = useFeatureRequests(includeHidden);

  const openFeatures = features
    .filter(f => f.status === 'open')
    .sort((a, b) => b.votes_count - a.votes_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
      setFormImageUrl(feature.card_image_url || '');
    } else {
      setEditing(null);
      setFormTitle('');
      setFormDesc('');
      setFormImageUrl('');
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;
    const payload = {
      title: formTitle,
      description: formDesc,
      card_image_url: formImageUrl || null,
    };
    if (editing) {
      update({ id: editing.id, ...payload });
    } else {
      create(payload);
    }
    setModalOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>{ps.titleTag}</title>
        <meta name="description" content={ps.metaDescription} />
      </Helmet>

      <PageHero title={ps.headerTitle} description={ps.headerDescription} />

      <div className="container mx-auto px-4 pt-12 md:pt-16 pb-8 max-w-7xl">

        {/* Admin toggle */}
        {effectiveAdmin && !loadingRoles && (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Switch
                id="management-mode"
                checked={isManagement}
                onCheckedChange={setIsManagement}
              />
              <Label htmlFor="management-mode" className="text-sm font-medium">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-64 rounded-[1.2rem]" />
            ))}
          </div>
        ) : openFeatures.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum lançamento em votação no momento.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={openFeatures.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
                <AnimatePresence mode="popLayout">
                  {openFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="h-full"
                    >
                      <SortableFeatureCard
                        feature={feature}
                        rank={index + 1}
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
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Título <span className="text-destructive">*</span></Label>
              <Input placeholder="Título do lançamento" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea placeholder="Descrição (opcional)" value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} />
            </div>
            <ImageField imageUrl={formImageUrl} onImageUrl={setFormImageUrl} />
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
