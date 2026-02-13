import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface PremiumItemForm {
  item_type: 'course' | 'job';
  title: string;
  slug: string;
  description_short: string;
  description_full: string;
  logo_url: string;
  external_url: string;
  tags: string;
  status: 'draft' | 'published';
  sort_order: number;
}

const AdminPremiumItemForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = id && id !== 'novo';
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PremiumItemForm>({
    item_type: 'course',
    title: '',
    slug: '',
    description_short: '',
    description_full: '',
    logo_url: '',
    external_url: '',
    tags: '',
    status: 'draft',
    sort_order: 0,
  });

  useEffect(() => {
    if (isEditing) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setForm({
        item_type: data.item_type,
        title: data.title,
        slug: data.slug,
        description_short: data.description_short || '',
        description_full: data.description_full || '',
        logo_url: data.logo_url || '',
        external_url: data.external_url || '',
        tags: (data.tags || []).join(', '),
        status: data.status,
        sort_order: data.sort_order || 0,
      });
    } catch (err) {
      console.error('Error fetching item:', err);
      toast({
        title: 'Erro',
        description: 'Item não encontrado.',
        variant: 'destructive',
      });
      navigate('/admin/premium/itens');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: !isEditing ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.slug.trim()) {
      toast({
        title: 'Erro',
        description: 'O slug é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const tags = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const itemData = {
        item_type: form.item_type,
        title: form.title.trim(),
        slug: form.slug.trim(),
        description_short: form.description_short.trim() || null,
        description_full: form.description_full.trim() || null,
        logo_url: form.logo_url.trim() || null,
        external_url: form.external_url.trim() || null,
        tags,
        status: form.status,
        sort_order: form.sort_order,
        published_at: form.status === 'published' ? new Date().toISOString() : null,
        updated_by: user?.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('premium_items')
          .update(itemData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Salvo',
          description: 'Item atualizado com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('premium_items')
          .insert({
            ...itemData,
            created_by: user?.id,
          });

        if (error) throw error;

        toast({
          title: 'Criado',
          description: 'Item criado com sucesso.',
        });
      }

      navigate('/admin/premium/itens');
    } catch (err: any) {
      console.error('Error saving item:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível salvar o item.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-96" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
        <Link 
          to="/admin/premium/itens" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>

        <h1 className="text-3xl font-bold mb-6">
          {isEditing ? 'Editar Item' : 'Novo Item Premium'}
        </h1>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="item_type">Tipo</Label>
                  <Select 
                    value={form.item_type} 
                    onValueChange={(value: 'course' | 'job') => setForm(prev => ({ ...prev, item_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Curso</SelectItem>
                      <SelectItem value="job">Vaga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={form.status} 
                    onValueChange={(value: 'draft' | 'published') => setForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: Curso de React Avançado"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="curso-react-avancado"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  URL: /premium/{form.item_type === 'course' ? 'cursos' : 'vagas'}/{form.slug || '...'}
                </p>
              </div>

              <div>
                <Label htmlFor="description_short">Descrição curta</Label>
                <Textarea
                  id="description_short"
                  value={form.description_short}
                  onChange={(e) => setForm(prev => ({ ...prev, description_short: e.target.value }))}
                  placeholder="Descrição breve exibida nos cards"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="description_full">Descrição completa</Label>
                <Textarea
                  id="description_full"
                  value={form.description_full}
                  onChange={(e) => setForm(prev => ({ ...prev, description_full: e.target.value }))}
                  placeholder="Descrição detalhada"
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="logo_url">URL do Logo</Label>
                  <Input
                    id="logo_url"
                    value={form.logo_url}
                    onChange={(e) => setForm(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="external_url">URL Externa (Acessar)</Label>
                  <Input
                    id="external_url"
                    value={form.external_url}
                    onChange={(e) => setForm(prev => ({ ...prev, external_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="React, JavaScript, Frontend"
                  />
                </div>

                <div>
                  <Label htmlFor="sort_order">Ordem de exibição</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Menor número = aparece primeiro
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin/premium/itens')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      
    </div>
  );
};

export default AdminPremiumItemForm;
