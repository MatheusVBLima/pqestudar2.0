import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Pencil, Trash2, ExternalLink, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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

interface AffiliatePage {
  id: string;
  affiliate_name: string;
  slug: string;
  basic_url: string;
  premium_url: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  id: "" as string | null,
  affiliate_name: "",
  slug: "",
  basic_url: "",
  premium_url: "",
  is_active: true,
  notes: "",
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

const validSlug = (s: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && s.length >= 2 && s.length <= 80;
const validUrl = (s: string) => {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

export default function AdminAffiliates() {
  const { toast } = useToast();
  const [items, setItems] = useState<AffiliatePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("affiliate_pages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    } else {
      setItems((data || []) as AffiliatePage[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm({ ...emptyForm });
    setSlugTouched(false);
    setOpen(true);
  };

  const openEdit = (it: AffiliatePage) => {
    setForm({
      id: it.id,
      affiliate_name: it.affiliate_name,
      slug: it.slug,
      basic_url: it.basic_url,
      premium_url: it.premium_url,
      is_active: it.is_active,
      notes: it.notes || "",
    });
    setSlugTouched(true);
    setOpen(true);
  };

  const onNameChange = (v: string) => {
    setForm((f) => ({
      ...f,
      affiliate_name: v,
      slug: slugTouched ? f.slug : slugify(v),
    }));
  };

  const onSubmit = async () => {
    if (!form.affiliate_name.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    if (!validSlug(form.slug)) {
      toast({ title: "Slug inválido", description: "Use apenas letras minúsculas, números e hífens.", variant: "destructive" });
      return;
    }
    if (!validUrl(form.basic_url) || !validUrl(form.premium_url)) {
      toast({ title: "Links inválidos", description: "Os links de checkout devem ser URLs válidas (https).", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      affiliate_name: form.affiliate_name.trim(),
      slug: form.slug.trim(),
      basic_url: form.basic_url.trim(),
      premium_url: form.premium_url.trim(),
      is_active: form.is_active,
      notes: form.notes.trim() || null,
    };
    const { error } = form.id
      ? await supabase.from("affiliate_pages").update(payload).eq("id", form.id)
      : await supabase.from("affiliate_pages").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: form.id ? "Afiliado atualizado" : "Afiliado criado" });
    setOpen(false);
    load();
  };

  const toggleActive = async (it: AffiliatePage) => {
    const { error } = await supabase
      .from("affiliate_pages")
      .update({ is_active: !it.is_active })
      .eq("id", it.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  const onDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("affiliate_pages").delete().eq("id", deleteId);
    setDeleteId(null);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Afiliado excluído" });
    load();
  };

  const publicUrl = (slug: string) => `${window.location.origin}/mapa-dos-beneficios/${slug}`;

  const copyUrl = async (slug: string) => {
    await navigator.clipboard.writeText(publicUrl(slug));
    toast({ title: "Link copiado!" });
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Afiliados — Admin PqEstudar</title>
      </Helmet>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Afiliados</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Páginas de afiliado da landing <code className="text-xs">/mapa-dos-beneficios</code>. Cada afiliado tem links próprios para os planos Básico e Premium, mantendo o mesmo template.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Novo afiliado
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lista de afiliados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Básico</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Carregando…</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum afiliado cadastrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.affiliate_name}</TableCell>
                    <TableCell>
                      <code className="text-xs">{it.slug}</code>
                    </TableCell>
                    <TableCell>
                      <a href={it.basic_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate inline-block max-w-[180px]">
                        {it.basic_url}
                      </a>
                    </TableCell>
                    <TableCell>
                      <a href={it.premium_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate inline-block max-w-[180px]">
                        {it.premium_url}
                      </a>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleActive(it)}
                        className="inline-flex items-center"
                        title="Clique para alterar status"
                      >
                        <Badge variant={it.is_active ? "default" : "secondary"}>
                          {it.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => copyUrl(it.slug)} title="Copiar URL pública">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" asChild title="Abrir página pública">
                          <a href={publicUrl(it.slug)} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(it)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(it.id)} title="Excluir">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar afiliado" : "Novo afiliado"}</DialogTitle>
            <DialogDescription>
              A página pública usará o template de <code>/mapa-dos-beneficios</code>, alterando apenas os links dos planos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do afiliado</Label>
              <Input
                id="name"
                value={form.affiliate_name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Ex.: João Silva"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug público</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                }}
                placeholder="joao-silva"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL pública: <code>/mapa-dos-beneficios/{form.slug || "slug"}</code>
              </p>
            </div>

            <div>
              <Label htmlFor="basic_url">Link do plano Básico</Label>
              <Input
                id="basic_url"
                value={form.basic_url}
                onChange={(e) => setForm((f) => ({ ...f, basic_url: e.target.value }))}
                placeholder="https://pay.cakto.com.br/..."
              />
            </div>

            <div>
              <Label htmlFor="premium_url">Link do plano Premium</Label>
              <Input
                id="premium_url"
                value={form.premium_url}
                onChange={(e) => setForm((f) => ({ ...f, premium_url: e.target.value }))}
                placeholder="https://pay.cakto.com.br/..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este link também é usado automaticamente no botão da seção de garantia.
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
              <Label htmlFor="active" className="cursor-pointer">
                Página ativa (acessível publicamente)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={onSubmit} disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir afiliado?</AlertDialogTitle>
            <AlertDialogDescription>
              A página pública desse afiliado deixará de funcionar imediatamente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
