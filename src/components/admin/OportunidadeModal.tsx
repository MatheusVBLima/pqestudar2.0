import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useOportunidadesAdmin, Oportunidade, FonteOportunidade } from "@/hooks/useOportunidades";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fonteSchema = z.object({
  source_url: z.string().url("URL inválida").regex(/^https?:\/\//, "URL deve começar com http:// ou https://"),
  source_title: z.string().optional(),
  source_tipo: z.enum(["oficial", "diario", "banca", "outro-oficial"]),
  source_date: z.string().optional(),
});

const formSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  categoria: z.enum(["Concurso", "Políticas Públicas", "Educação"]),
  tipo: z.enum(["Concurso", "Programa educacional", "Processo seletivo"]),
  escolaridade: z.enum(["Fundamental", "Médio", "Superior"]),
  abrangencia: z.enum(["Nacional", "Estadual", "Municipal"]),
  situacao: z.enum(["Previsto", "Edital publicado", "Aberto", "Encerrado"]),
  link_edital: z.string().url("URL inválida").optional().or(z.literal("")),
  orgao: z.string().optional(),
  banca: z.string().optional(),
  resumo_editorial: z.string().optional(),
  data_publicacao: z.string().optional(),
  publicado: z.boolean().default(false),
  fontes: z.array(fonteSchema).min(0),
}).refine(
  (data) => {
    if (data.situacao === "Aberto" || data.situacao === "Edital publicado") {
      return data.link_edital && data.link_edital.length > 0;
    }
    return true;
  },
  {
    message: "Link do edital é obrigatório quando a situação é 'Aberto' ou 'Edital publicado'",
    path: ["link_edital"],
  }
).refine(
  (data) => {
    if (data.publicado) {
      return data.fontes.some(f => 
        ["oficial", "diario", "banca", "outro-oficial"].includes(f.source_tipo)
      );
    }
    return true;
  },
  {
    message: "Para publicar, é necessário pelo menos uma fonte oficial",
    path: ["fontes"],
  }
);

type FormData = z.infer<typeof formSchema>;

interface OportunidadeModalProps {
  open: boolean;
  onClose: () => void;
  editingItem: Oportunidade | null;
  onSuccess: () => void;
}

export default function OportunidadeModal({
  open,
  onClose,
  editingItem,
  onSuccess,
}: OportunidadeModalProps) {
  const { createOportunidade, updateOportunidade, isCreating, isUpdating } = useOportunidadesAdmin();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      slug: "",
      categoria: "Concurso",
      tipo: "Concurso",
      escolaridade: "Médio",
      abrangencia: "Nacional",
      situacao: "Previsto",
      link_edital: "",
      orgao: "",
      banca: "",
      resumo_editorial: "",
      data_publicacao: new Date().toISOString().split("T")[0],
      publicado: false,
      fontes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fontes",
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        titulo: editingItem.titulo,
        slug: editingItem.slug,
        categoria: editingItem.categoria,
        tipo: editingItem.tipo,
        escolaridade: editingItem.escolaridade,
        abrangencia: editingItem.abrangencia,
        situacao: editingItem.situacao,
        link_edital: editingItem.link_edital || "",
        orgao: editingItem.orgao || "",
        banca: editingItem.banca || "",
        resumo_editorial: editingItem.resumo_editorial || "",
        data_publicacao: editingItem.data_publicacao?.split("T")[0] || new Date().toISOString().split("T")[0],
        publicado: editingItem.publicado,
        fontes: editingItem.fontes_oportunidade?.map(f => ({
          source_url: f.source_url,
          source_title: f.source_title || "",
          source_tipo: f.source_tipo,
          source_date: f.source_date?.split("T")[0] || "",
        })) || [],
      });
    } else {
      form.reset({
        titulo: "",
        slug: "",
        categoria: "Concurso",
        tipo: "Concurso",
        escolaridade: "Médio",
        abrangencia: "Nacional",
        situacao: "Previsto",
        link_edital: "",
        orgao: "",
        banca: "",
        resumo_editorial: "",
        data_publicacao: new Date().toISOString().split("T")[0],
        publicado: false,
        fontes: [],
      });
    }
    setError(null);
  }, [editingItem, form, open]);

  // Auto-generate slug from title
  const titulo = form.watch("titulo");
  useEffect(() => {
    if (!editingItem && titulo) {
      const slug = titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 100);
      form.setValue("slug", slug);
    }
  }, [titulo, editingItem, form]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    
    try {
      const payload = {
        titulo: data.titulo,
        slug: data.slug,
        categoria: data.categoria,
        tipo: data.tipo,
        escolaridade: data.escolaridade,
        abrangencia: data.abrangencia,
        situacao: data.situacao,
        publicado: data.publicado,
        id: editingItem?.id,
        link_edital: data.link_edital || undefined,
        orgao: data.orgao || undefined,
        banca: data.banca || undefined,
        resumo_editorial: data.resumo_editorial || undefined,
        data_publicacao: data.data_publicacao ? new Date(data.data_publicacao).toISOString() : new Date().toISOString(),
        fontes: data.fontes.map(f => ({
          source_url: f.source_url,
          source_title: f.source_title || undefined,
          source_tipo: f.source_tipo,
          source_date: f.source_date ? new Date(f.source_date).toISOString() : undefined,
        })),
      };

      if (editingItem) {
        await updateOportunidade(payload as any);
      } else {
        await createOportunidade(payload as any);
      }
      
      onSuccess();
    } catch (e: any) {
      setError(e.message || "Erro ao salvar oportunidade");
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar Oportunidade" : "Nova Oportunidade"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Concurso INSS 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="concurso-inss-2025" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL amigável (gerado automaticamente)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Concurso">Concurso</SelectItem>
                        <SelectItem value="Políticas Públicas">Políticas Públicas</SelectItem>
                        <SelectItem value="Educação">Educação</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Concurso">Concurso</SelectItem>
                        <SelectItem value="Programa educacional">Programa educacional</SelectItem>
                        <SelectItem value="Processo seletivo">Processo seletivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="escolaridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escolaridade *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fundamental">Fundamental</SelectItem>
                        <SelectItem value="Médio">Médio</SelectItem>
                        <SelectItem value="Superior">Superior</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="abrangencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abrangência *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nacional">Nacional</SelectItem>
                        <SelectItem value="Estadual">Estadual</SelectItem>
                        <SelectItem value="Municipal">Municipal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="situacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Situação *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Previsto">Previsto</SelectItem>
                        <SelectItem value="Edital publicado">Edital publicado</SelectItem>
                        <SelectItem value="Aberto">Aberto</SelectItem>
                        <SelectItem value="Encerrado">Encerrado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_publicacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Publicação</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Optional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="link_edital"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>
                      Link do Edital
                      {(form.watch("situacao") === "Aberto" || form.watch("situacao") === "Edital publicado") && " *"}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://exemplo.gov.br/edital.pdf" {...field} />
                    </FormControl>
                    <FormDescription>
                      Obrigatório quando a situação é "Aberto" ou "Edital publicado"
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orgao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Órgão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: INSS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="banca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: CEBRASPE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resumo_editorial"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Resumo Editorial</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Texto informativo sobre a oportunidade..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use linguagem informativa: "Segundo informações divulgadas por..."
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Fontes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium">Fontes</h4>
                  <p className="text-sm text-muted-foreground">
                    É necessário pelo menos uma fonte oficial para publicar
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({
                    source_url: "",
                    source_title: "",
                    source_tipo: "oficial",
                    source_date: "",
                  })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4 border rounded-md">
                  Nenhuma fonte adicionada
                </p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-md p-4 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                        <FormField
                          control={form.control}
                          name={`fontes.${index}.source_url`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>URL *</FormLabel>
                              <FormControl>
                                <Input placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fontes.${index}.source_title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome da fonte" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fontes.${index}.source_tipo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="oficial">Oficial</SelectItem>
                                  <SelectItem value="diario">Diário Oficial</SelectItem>
                                  <SelectItem value="banca">Banca</SelectItem>
                                  <SelectItem value="outro-oficial">Outro oficial</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fontes.${index}.source_date`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data da Fonte</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {form.formState.errors.fontes?.root && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.fontes.root.message}
                </p>
              )}
            </div>

            <Separator />

            {/* Publicar */}
            <FormField
              control={form.control}
              name="publicado"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Publicar</FormLabel>
                    <FormDescription>
                      Tornar visível para o público. Requer pelo menos uma fonte oficial.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingItem ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}