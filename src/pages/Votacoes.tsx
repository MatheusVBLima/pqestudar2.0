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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
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

// Constante reutilizável de border-radius padrão do projeto
const UI_RADIUS = 'rounded-[1.2rem]';

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
  const [imgFailed, setImgFailed] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: feature.id,
    disabled: !isManagement,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Gradiente determinístico por título
  const hue = feature.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const gradientStyle = {
    background: `linear-gradient(135deg, hsl(${hue} 40% 20%), hsl(${(hue + 60) % 360} 50% 35%))`,
  };

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const src = (e.currentTarget as HTMLImageElement).src;
    console.error('[Votacoes] Falha ao carregar imagem:', src);
    setImgFailed(true);
    // Se for URL externa bloqueada, avisar admin
    if (isAdmin && feature.card_image_url && !feature.card_image_url.includes('supabase')) {
      toast({
        title: 'URL bloqueada pelo servidor externo',
        description: 'Faça upload da imagem no sistema para evitar bloqueios.',
        variant: 'destructive',
      });
    }
  };

  const showImage = feature.card_image_url && !imgFailed;

  return (
    <div ref={setNodeRef} style={style} className="relative group h-full">
      <div
        className={`border border-border bg-card flex flex-col h-full overflow-hidden
          transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${UI_RADIUS}`}
      >
        {/* Cover area */}
        <div className="relative" style={{ aspectRatio: '16/9' }}>
          {showImage ? (
            <img
              src={feature.card_image_url!}
              alt={feature.title}
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover rounded-t-[1.2rem]`}
              onError={handleImgError}
            />
          ) : (
            <div
              className="absolute inset-0 rounded-t-[1.2rem]"
              style={gradientStyle}
            />
          )}

          {/* Rank badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`inline-flex items-center justify-center bg-background/80 backdrop-blur-sm
              border border-border text-foreground text-xs font-bold px-2.5 py-1 shadow-sm ${UI_RADIUS}`}>
              #{rank}
            </span>
          </div>

          {/* Vote counter overlay */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className={`inline-flex items-center gap-1.5 bg-background/80 backdrop-blur-sm
              border border-border text-foreground text-xs font-semibold px-2.5 py-1 shadow-sm ${UI_RADIUS}`}>
              <ThumbsUp className="h-3 w-3" />
              {feature.votes_count}
            </span>
          </div>

          {/* Admin controls overlay */}
          {isManagement && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div {...attributes} {...listeners}
                className={`cursor-grab active:cursor-grabbing p-1.5 bg-background/80 backdrop-blur-sm hover:bg-accent ${UI_RADIUS}`}>
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 bg-background/80 backdrop-blur-sm hover:bg-accent ${UI_RADIUS}`} onClick={() => onEdit(feature)}>
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 bg-background/80 backdrop-blur-sm hover:bg-accent ${UI_RADIUS}`} onClick={() => onToggle(feature)}>
                {feature.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </Button>
              <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 bg-background/80 backdrop-blur-sm hover:bg-accent ${UI_RADIUS}`} onClick={() => onComplete(feature)}>
                <CheckCircle className="w-3.5 h-3.5 text-primary" />
              </Button>
              <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 bg-background/80 backdrop-blur-sm hover:bg-accent text-destructive hover:text-destructive ${UI_RADIUS}`} onClick={() => onDelete(feature)}>
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
              className={`w-full gap-2 text-sm ${UI_RADIUS}`}
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${feature.user_voted ? 'fill-current' : ''}`} />
              {feature.user_voted ? 'Votado ✓' : 'Votar'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast({ title: 'Faça login para votar' })}
              className={`w-full gap-2 text-sm ${UI_RADIUS}`}
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

/* ─── Image Field (Upload | URL) — padrão idêntico ao ToolModal de /ferramentas ─── */
// O upload NÃO acontece aqui: apenas armazena o File e gera preview local.
// O upload real ocorre no handleSave (com sessão auth garantida).
function ImageField({
  imageUrl,
  pendingFile,
  onImageUrl,
  onPendingFile,
}: {
  imageUrl: string;
  pendingFile: File | null;
  onImageUrl: (url: string) => void;
  onPendingFile: (file: File | null) => void;
}) {
  const [source, setSource] = useState<'upload' | 'url'>('url');
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [previewFailed, setPreviewFailed] = useState(false);
  const [localPreview, setLocalPreview] = useState(''); // blob URL para preview antes do upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync urlInput quando imageUrl muda externamente (ex: edição de item existente)
  const prevImageUrl = useRef(imageUrl);
  if (prevImageUrl.current !== imageUrl) {
    prevImageUrl.current = imageUrl;
    if (imageUrl.startsWith('http') && !pendingFile) {
      setUrlInput(imageUrl);
    }
  }

  const handleFileSelect = (file: File) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast({ title: 'Formato não suportado. Use PNG, JPG ou WEBP.', variant: 'destructive' });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: 'Imagem muito grande. Máximo 3MB.', variant: 'destructive' });
      return;
    }
    // Gera preview local sem fazer upload ainda
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setPreviewFailed(false);
    onPendingFile(file);
    // Limpa imageUrl anterior para usar preview local
    onImageUrl('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // URL: só confirma ao sair do campo (onBlur) ou pressionar Enter — evita 400 com URL parcial
  const commitUrl = (v: string) => {
    setUrlError('');
    setPreviewFailed(false);
    if (!v) {
      onImageUrl('');
      return;
    }
    if (!v.startsWith('http')) {
      setUrlError('URL deve começar com http:// ou https://');
      return;
    }
    onPendingFile(null);
    setLocalPreview('');
    onImageUrl(v);
  };

  const handleRemove = () => {
    onImageUrl('');
    onPendingFile(null);
    setUrlInput('');
    setUrlError('');
    setPreviewFailed(false);
    setLocalPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Preview exibido: blob local (arquivo selecionado) ou URL do banco
  const previewSrc = localPreview || imageUrl;

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5" />
        Imagem do Card
        <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
      </Label>

      <Tabs value={source} onValueChange={(v) => {
        setSource(v as 'upload' | 'url');
        setPreviewFailed(false);
      }}>
        <TabsList className={`grid w-full grid-cols-2 ${UI_RADIUS}`}>
          <TabsTrigger value="upload"><Upload className="w-3.5 h-3.5 mr-1.5" />Upload</TabsTrigger>
          <TabsTrigger value="url"><LinkIcon className="w-3.5 h-3.5 mr-1.5" />URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-2">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed p-5 text-center transition-colors cursor-pointer ${UI_RADIUS} ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {pendingFile ? (
              <div className="space-y-1">
                <Upload className="w-6 h-6 mx-auto text-primary" />
                <p className="text-sm font-medium text-foreground">{pendingFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(pendingFile.size / 1024 / 1024).toFixed(2)} MB — será enviado ao salvar
                </p>
              </div>
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
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-2 space-y-2">
          <Input
            type="url"
            placeholder="https://exemplo.com/imagem.jpg"
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setUrlError(''); }}
            onBlur={(e) => commitUrl(e.target.value.trim())}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitUrl(urlInput.trim()); } }}
          />
          {urlError && <p className="text-xs text-destructive">{urlError}</p>}
          {urlInput && !urlError && (
            <p className="text-xs text-muted-foreground">
              ⚠️ Algumas URLs externas podem ser bloqueadas ao renderizar. Prefira fazer Upload.
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview + remove */}
      {previewSrc && (
        <div className={`relative overflow-hidden border border-border ${UI_RADIUS}`} style={{ aspectRatio: '16/9' }}>
          {!previewFailed ? (
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => {
                console.error('[Votacoes] Preview falhou para:', previewSrc);
                setPreviewFailed(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted gap-2">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <p className="text-xs text-muted-foreground text-center px-4">
                Pré-visualização bloqueada.<br />A URL foi salva — pode funcionar no card.
              </p>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className={`absolute top-2 right-2 h-7 w-7 p-0 ${UI_RADIUS}`}
            onClick={handleRemove}
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
  const [formPendingFile, setFormPendingFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      setFormPendingFile(null);
    } else {
      setEditing(null);
      setFormTitle('');
      setFormDesc('');
      setFormImageUrl('');
      setFormPendingFile(null);
    }
    setModalOpen(true);
  };

  // Upload só ocorre aqui — com sessão auth garantida (padrão /ferramentas)
  const handleSave = async () => {
    if (!formTitle.trim()) return;
    setIsSaving(true);
    try {
      let finalImageUrl = formImageUrl || null;

      // Se há arquivo pendente, faz upload agora (sessão garantida)
      if (formPendingFile) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 10);
        const ext = formPendingFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `vote-${timestamp}-${random}.${ext}`;

        console.log('[Votacoes] Upload no save:', fileName, formPendingFile.type);
        const { data, error } = await supabase.storage
          .from('vote-images')
          .upload(fileName, formPendingFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          console.error('[Votacoes] Erro no upload:', error);
          toast({
            title: 'Erro ao enviar imagem',
            description: error.message,
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('vote-images')
          .getPublicUrl(data.path);

        console.log('[Votacoes] Upload OK, URL pública:', publicUrl);
        finalImageUrl = publicUrl;
      }

      const payload = {
        title: formTitle,
        description: formDesc,
        card_image_url: finalImageUrl,
      };

      if (editing) {
        update({ id: editing.id, ...payload });
      } else {
        create(payload);
      }
      setModalOpen(false);
      setFormPendingFile(null);
    } catch (err: any) {
      console.error('[Votacoes] Erro ao salvar:', err);
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
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
              <Skeleton key={i} className={`h-64 ${UI_RADIUS}`} />
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

      {/* Add/Edit Modal — com DialogDescription para acessibilidade */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className={`sm:max-w-[520px] max-h-[90vh] overflow-y-auto ${UI_RADIUS}`}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Edite as informações do lançamento e a imagem do card.'
                : 'Preencha as informações do novo lançamento para votação.'}
            </DialogDescription>
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
            <ImageField imageUrl={formImageUrl} pendingFile={formPendingFile} onImageUrl={setFormImageUrl} onPendingFile={setFormPendingFile} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formTitle.trim() || isSaving}>
              {isSaving ? 'Salvando…' : 'Salvar'}
            </Button>
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
