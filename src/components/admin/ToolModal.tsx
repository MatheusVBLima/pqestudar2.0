import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tool } from "@/hooks/useTools";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Sparkles, Upload, Link as LinkIcon, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ToolModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tool: Partial<Tool>) => Promise<void>;
  tool?: Tool | null;
  availableTags: string[];
}

export function ToolModal({ open, onClose, onSave, tool, availableTags }: ToolModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState(false);
  const [logoSource, setLogoSource] = useState<"upload" | "url">("url");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentSource, setAttachmentSource] = useState<"upload" | "url">("url");
  const [uploadedAttachment, setUploadedAttachment] = useState<File | null>(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Featured fields
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredIndefinite, setFeaturedIndefinite] = useState(false);
  const [featuredStart, setFeaturedStart] = useState("");
  const [featuredEnd, setFeaturedEnd] = useState("");

  // Editorial fields (individual tool page /ferramentas/[slug])
  const [whatIs, setWhatIs] = useState("");
  const [whoFor, setWhoFor] = useState("");
  const [howHelps, setHowHelps] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [extraMarkdown, setExtraMarkdown] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");


  useEffect(() => {
    if (tool) {
      setName(tool.name);
      setDescription(tool.description);
      setUrl(tool.url || "");
      setAttachmentUrl((tool as any).attachment_url || "");
      setIconUrl(tool.icon_url || "");
      setSelectedTags(tool.tags || []);
      setIsVisible(tool.is_visible);
      setIsFeatured(tool.is_featured ?? false);
      setFeaturedIndefinite(tool.featured_indefinite ?? false);
      setFeaturedStart(tool.featured_start ? tool.featured_start.slice(0, 16) : "");
      setFeaturedEnd(tool.featured_end ? tool.featured_end.slice(0, 16) : "");
    } else {
      setName("");
      setDescription("");
      setUrl("");
      setAttachmentUrl("");
      setIconUrl("");
      setSelectedTags([]);
      setIsVisible(true);
      setIsFeatured(false);
      setFeaturedIndefinite(false);
      setFeaturedStart("");
      setFeaturedEnd("");
    }
    setErrors({});
    setUploadedFile(null);
    setUploadPreview("");
    setImageError(false);
    setLogoSource("url");
    setUploadedAttachment(null);
    setAttachmentSource("url");
  }, [tool, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (name.length > 100) {
      newErrors.name = "Nome deve ter no máximo 100 caracteres";
    }

    if (!description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    } else if (description.length > 500) {
      newErrors.description = "Descrição deve ter no máximo 500 caracteres";
    }

    if (url && !url.match(/^https?:\/\/.+/)) {
      newErrors.url = "URL deve começar com http:// ou https://";
    }

    if (attachmentUrl && !attachmentUrl.match(/^https?:\/\/.+/)) {
      newErrors.attachmentUrl = "URL do anexo deve começar com http:// ou https://";
    }

    if (iconUrl && !iconUrl.match(/^https?:\/\/.+/)) {
      newErrors.iconUrl = "URL do ícone deve começar com http:// ou https://";
    }

    if (selectedTags.length === 0) {
      newErrors.tags = "Selecione pelo menos uma categoria";
    }

    // Featured validations
    if (isFeatured && !featuredIndefinite) {
      if (!featuredStart) {
        newErrors.featuredStart = "Informe o início do destaque";
      }
      if (!featuredEnd) {
        newErrors.featuredEnd = "Informe o fim do destaque";
      }
      if (featuredStart && featuredEnd && featuredEnd < featuredStart) {
        newErrors.featuredEnd = "Fim do destaque deve ser após o início";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (file: File) => {
    console.log("[Ferramentas] Upload LOGO -> bucket: tools-icons, file:", file?.name);
    const maxSize = 1.5 * 1024 * 1024; // 1.5MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, logoUpload: "Formato não suportado para logo. Use PNG, JPG, WEBP ou SVG." }));
      toast.error("Por favor, selecione uma imagem para o logo");
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, logoUpload: "Arquivo muito grande. Máximo 1.5MB." }));
      toast.error("Imagem muito grande. Máximo 1.5MB");
      return;
    }

    setUploadedFile(file);
    setErrors(prev => ({ ...prev, logoUpload: "" }));
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadToStorage = async (file: File, toolId: string): Promise<string> => {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const ext = file.name.split('.').pop();
    const fileName = `${toolId}-${timestamp}.${ext}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('tools-icons')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('tools-icons')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const uploadAttachmentToStorage = async (file: File, toolId: string): Promise<string> => {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const ext = file.name.split('.').pop();
    const fileName = `${toolId}-${timestamp}.${ext}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('tools-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('tools-attachments')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleAttachmentFileSelect = (file: File) => {
    console.log("[Ferramentas] Upload ANEXO -> bucket: tools-attachments, file:", file?.name);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/plain',
      'application/epub+zip'
    ];

    // Bloquear imagens explicitamente no campo de anexo
    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (imageTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, attachmentUpload: "Imagens não são permitidas aqui. Use o campo 'Logo/Ícone' para imagens." }));
      toast.error("Use o campo Logo/Ícone para fazer upload de imagens");
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, attachmentUpload: "Formato não suportado. Use PDF, ZIP, DOCX, XLSX, TXT ou EPUB." }));
      toast.error("Formato de arquivo não suportado para anexo");
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, attachmentUpload: "Arquivo muito grande. Máximo 10MB." }));
      toast.error("Arquivo muito grande. Máximo 10MB");
      return;
    }

    setUploadedAttachment(file);
    setErrors(prev => ({ ...prev, attachmentUpload: "" }));
  };

  const handleAttachmentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAttachment(false);
    const file = e.dataTransfer.files[0];
    if (file) handleAttachmentFileSelect(file);
  };

  const handleAttachmentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAttachment(true);
  };

  const handleAttachmentDragLeave = () => {
    setIsDraggingAttachment(false);
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      let finalIconUrl = iconUrl.trim() || undefined;
      let finalAttachmentUrl = attachmentUrl.trim() || undefined;

      // If uploading a logo file, upload to storage first
      if (logoSource === "upload" && uploadedFile) {
        setUploading(true);
        try {
          const toolId = tool?.id || crypto.randomUUID();
          finalIconUrl = await uploadToStorage(uploadedFile, toolId);
        } catch (error) {
          toast.error("Erro ao fazer upload da imagem");
          console.error("Upload error:", error);
          setSaving(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      // If uploading an attachment file, upload to storage
      if (attachmentSource === "upload" && uploadedAttachment) {
        setAttachmentUploading(true);
        try {
          const toolId = tool?.id || crypto.randomUUID();
          finalAttachmentUrl = await uploadAttachmentToStorage(uploadedAttachment, toolId);
        } catch (error) {
          toast.error("Erro ao fazer upload do anexo");
          console.error("Attachment upload error:", error);
          setSaving(false);
          setAttachmentUploading(false);
          return;
        } finally {
          setAttachmentUploading(false);
        }
      }

      await onSave({
        ...(tool?.id && { id: tool.id }),
        name: name.trim(),
        description: description.trim(),
        url: url.trim() || undefined,
        attachment_url: finalAttachmentUrl,
        icon_url: finalIconUrl,
        tags: selectedTags,
        is_visible: isVisible,
        is_featured: isFeatured,
        featured_indefinite: isFeatured ? featuredIndefinite : false,
        featured_start: isFeatured && !featuredIndefinite && featuredStart ? new Date(featuredStart).toISOString() : null,
        featured_end: isFeatured && !featuredIndefinite && featuredEnd ? new Date(featuredEnd).toISOString() : null,
      } as any);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setErrors((prev) => ({ ...prev, tags: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tool ? "Editar Ferramenta" : "Adicionar Ferramenta"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="Ex: ChatGPT Plus"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder="Breve descrição da ferramenta..."
              rows={3}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-destructive">
                {errors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setErrors((prev) => ({ ...prev, url: "" }));
              }}
              placeholder="https://exemplo.com"
              aria-invalid={!!errors.url}
              aria-describedby={errors.url ? "url-error" : undefined}
            />
            {errors.url && (
              <p id="url-error" className="text-sm text-destructive">
                {errors.url}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Anexo (URL para Download)</Label>
            <Tabs value={attachmentSource} onValueChange={(v) => setAttachmentSource(v as "upload" | "url")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-3">
                <div
                  onDrop={handleAttachmentDrop}
                  onDragOver={handleAttachmentDragOver}
                  onDragLeave={handleAttachmentDragLeave}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDraggingAttachment ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                >
                  {uploadedAttachment ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-lg bg-muted flex items-center justify-center">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">{uploadedAttachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedAttachment.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedAttachment(null)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm mb-2">Arraste um arquivo ou</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => attachmentInputRef.current?.click()}
                      >
                        Selecionar arquivo
                      </Button>
                       <input
                         ref={attachmentInputRef}
                         type="file"
                         name="attachment-upload"
                         id="attachment-upload-input"
                         accept=".pdf,.zip,.docx,.xlsx,.xls,.txt,.epub"
                         className="hidden"
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) handleAttachmentFileSelect(file);
                         }}
                       />
                      <p className="text-xs text-muted-foreground mt-2">
                        PDF, ZIP, DOCX, XLSX, TXT ou EPUB • Máx 10MB
                      </p>
                    </>
                  )}
                </div>
                {errors.attachmentUpload && (
                  <p className="text-sm text-destructive">{errors.attachmentUpload}</p>
                )}
              </TabsContent>

              <TabsContent value="url" className="space-y-3">
                <Input
                  id="attachmentUrl"
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => {
                    setAttachmentUrl(e.target.value);
                    setErrors((prev) => ({ ...prev, attachmentUrl: "" }));
                  }}
                  placeholder="https://exemplo.com/arquivo.pdf"
                  aria-invalid={!!errors.attachmentUrl}
                  aria-describedby={errors.attachmentUrl ? "attachmentUrl-error attachmentUrl-help" : "attachmentUrl-help"}
                />
                <p id="attachmentUrl-help" className="text-xs text-muted-foreground">
                  Opcional. Link direto para um arquivo (PDF, e-book, etc.)
                </p>
                {errors.attachmentUrl && (
                  <p id="attachmentUrl-error" className="text-sm text-destructive">
                    {errors.attachmentUrl}
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label>Logo/Ícone</Label>
            <Tabs value={logoSource} onValueChange={(v) => setLogoSource(v as "upload" | "url")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-3">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                >
                  {uploadPreview ? (
                    <div className="space-y-3">
                      <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center overflow-hidden border shadow-sm">
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{uploadedFile?.name}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadPreview("");
                        }}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm mb-2">Arraste uma imagem ou</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Selecionar arquivo
                      </Button>
                       <input
                         ref={fileInputRef}
                         type="file"
                         name="logo-upload"
                         id="logo-upload-input"
                         accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                         className="hidden"
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) handleFileSelect(file);
                         }}
                       />
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG, WEBP ou SVG • Máx 1.5MB
                      </p>
                    </>
                  )}
                </div>
                {errors.logoUpload && (
                  <p className="text-sm text-destructive">{errors.logoUpload}</p>
                )}
              </TabsContent>

              <TabsContent value="url" className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      id="iconUrl"
                      type="url"
                      value={iconUrl}
                      onChange={(e) => {
                        setIconUrl(e.target.value);
                        setImageError(false);
                        setErrors((prev) => ({ ...prev, iconUrl: "" }));
                      }}
                      placeholder="https://exemplo.com/logo.png"
                      aria-invalid={!!errors.iconUrl}
                      aria-describedby={errors.iconUrl ? "iconUrl-error" : undefined}
                    />
                    {errors.iconUrl && (
                      <p id="iconUrl-error" className="text-sm text-destructive mt-1">
                        {errors.iconUrl}
                      </p>
                    )}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border shadow-sm">
                    {iconUrl && !imageError ? (
                      <img
                        src={iconUrl}
                        alt="Preview do logo"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <Sparkles className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
                    )}
                  </div>
                </div>
                {iconUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      setIconUrl("");
                      setImageError(false);
                    }}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remover URL
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label>
              Categorias <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 text-sm hover:opacity-80"
                  onClick={() => toggleTag(tag)}
                  role="checkbox"
                  aria-checked={selectedTags.includes(tag)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleTag(tag);
                    }
                  }}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="w-3 h-3 ml-1" aria-hidden="true" />
                  )}
                </Badge>
              ))}
            </div>
            {errors.tags && (
              <p className="text-sm text-destructive">{errors.tags}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="visible"
              checked={isVisible}
              onCheckedChange={setIsVisible}
            />
            <Label htmlFor="visible" className="cursor-pointer">
              Visível para o público
            </Label>
          </div>

          {/* ── Bloco Destaque ── */}
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <span className="text-sm font-semibold">Destaque</span>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={isFeatured}
                onCheckedChange={(v) => {
                  setIsFeatured(v);
                  if (!v) {
                    setFeaturedIndefinite(false);
                    setFeaturedStart("");
                    setFeaturedEnd("");
                    setErrors((prev) => ({ ...prev, featuredStart: "", featuredEnd: "" }));
                  }
                }}
              />
              <Label htmlFor="is_featured" className="cursor-pointer">
                Ferramenta em destaque
              </Label>
            </div>

            {isFeatured && (
              <div className="space-y-3 pl-2 border-l-2 border-amber-400/40">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured_indefinite"
                    checked={featuredIndefinite}
                    onCheckedChange={(v) => {
                      setFeaturedIndefinite(v);
                      if (v) {
                        setFeaturedStart("");
                        setFeaturedEnd("");
                        setErrors((prev) => ({ ...prev, featuredStart: "", featuredEnd: "" }));
                      }
                    }}
                  />
                  <Label htmlFor="featured_indefinite" className="cursor-pointer text-sm">
                    Destaque indeterminado (sem prazo)
                  </Label>
                </div>

                {!featuredIndefinite && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="featured_start" className="text-xs text-muted-foreground">
                        Início do destaque
                      </Label>
                      <Input
                        id="featured_start"
                        type="datetime-local"
                        value={featuredStart}
                        onChange={(e) => {
                          setFeaturedStart(e.target.value);
                          setErrors((prev) => ({ ...prev, featuredStart: "" }));
                        }}
                        aria-invalid={!!errors.featuredStart}
                      />
                      {errors.featuredStart && (
                        <p className="text-xs text-destructive">{errors.featuredStart}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="featured_end" className="text-xs text-muted-foreground">
                        Fim do destaque
                      </Label>
                      <Input
                        id="featured_end"
                        type="datetime-local"
                        value={featuredEnd}
                        onChange={(e) => {
                          setFeaturedEnd(e.target.value);
                          setErrors((prev) => ({ ...prev, featuredEnd: "" }));
                        }}
                        aria-invalid={!!errors.featuredEnd}
                      />
                      {errors.featuredEnd && (
                        <p className="text-xs text-destructive">{errors.featuredEnd}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving || uploading || attachmentUploading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading || attachmentUploading}>
            {uploading || attachmentUploading ? "Enviando..." : saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
