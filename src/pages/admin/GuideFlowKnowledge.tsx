import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/admin/dashboard/PageHeader';
import { useGuideFlowKnowledge, type KnowledgeEntry } from '@/hooks/useGuideFlowKnowledge';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, BookOpen, Loader2, Eye, EyeOff } from 'lucide-react';

const CATEGORIES = [
  { value: 'editorial', label: '✍️ Editorial' },
  { value: 'tom', label: '🗣️ Tom e Linguagem' },
  { value: 'cta', label: '🎯 CTAs' },
  { value: 'seo', label: '🔍 SEO' },
  { value: 'estrutura', label: '🏗️ Estrutura' },
  { value: 'referencia', label: '📚 Referência' },
  { value: 'geral', label: '📋 Geral' },
];

const categoryLabel = (cat: string) => CATEGORIES.find((c) => c.value === cat)?.label || cat;

interface FormData {
  title: string;
  content: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

const EMPTY_FORM: FormData = { title: '', content: '', category: 'geral', is_active: true, sort_order: 0 };

export default function GuideFlowKnowledge() {
  const { entries, isLoading, createEntry, updateEntry, deleteEntry } = useGuideFlowKnowledge();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (entry: KnowledgeEntry) => {
    setEditingId(entry.id);
    setForm({
      title: entry.title,
      content: entry.content,
      category: entry.category,
      is_active: entry.is_active,
      sort_order: entry.sort_order,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: 'Campos obrigatórios', description: 'Título e conteúdo são obrigatórios.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await updateEntry(editingId, form);
        toast({ title: 'Entrada atualizada' });
      } else {
        await createEntry(form);
        toast({ title: 'Entrada criada' });
      }
      setModalOpen(false);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      toast({ title: 'Entrada removida' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleToggle = async (entry: KnowledgeEntry) => {
    try {
      await updateEntry(entry.id, { is_active: !entry.is_active });
      toast({ title: entry.is_active ? 'Entrada desativada' : 'Entrada ativada' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const filtered = filterCategory === 'all' ? entries : entries.filter((e) => e.category === filterCategory);
  const activeCount = entries.filter((e) => e.is_active).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca de Conhecimento"
        description="Regras editoriais e referências usadas pela IA na geração de guias."
      />

      {/* Stats + actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <BookOpen className="h-3 w-3" />
            {entries.length} entrada(s) — {activeCount} ativa(s)
          </Badge>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px] h-8 text-xs rounded-[var(--admin-radius)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="gap-1.5 rounded-[var(--admin-radius)]" size="sm">
          <Plus className="h-4 w-4" /> Nova entrada
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-[var(--admin-radius)]">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {entries.length === 0
                ? 'Nenhuma entrada na biblioteca. Crie regras editoriais para melhorar a geração de guias.'
                : 'Nenhuma entrada nesta categoria.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <Card
              key={entry.id}
              className={`rounded-[var(--admin-radius)] transition-opacity ${!entry.is_active ? 'opacity-50' : ''}`}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium truncate">{entry.title}</h3>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {categoryLabel(entry.category)}
                      </Badge>
                      {!entry.is_active && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          <EyeOff className="h-2.5 w-2.5 mr-0.5" /> Inativa
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{entry.content}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(entry)}
                      className="h-7 w-7 p-0"
                      title={entry.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {entry.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(entry)}
                      className="h-7 w-7 p-0"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar entrada' : 'Nova entrada'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Regra de tom editorial"
                className="rounded-[var(--admin-radius)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger className="rounded-[var(--admin-radius)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Conteúdo *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Cole aqui a regra editorial, referência ou diretriz..."
                rows={8}
                className="rounded-[var(--admin-radius)]"
              />
              <p className="text-xs text-muted-foreground">{form.content.length} caracteres</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
                />
                <Label className="text-sm">Ativa</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Ordem</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-20 h-8 rounded-[var(--admin-radius)]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-[var(--admin-radius)]">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-1.5 rounded-[var(--admin-radius)]">
              {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
