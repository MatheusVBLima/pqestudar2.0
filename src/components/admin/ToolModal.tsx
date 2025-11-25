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
import { X, Sparkles, Upload, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  useEffect(() => {
    if (tool) {
      setName(tool.name);
      setDescription(tool.description);
      setUrl(tool.url || "");
      setAttachmentUrl((tool as any).attachment_url || "");
      setIconUrl(tool.icon_url || "");
      setSelectedTags(tool.tags || []);
      setIsVisible(tool.is_visible);
    } else {
      setName("");
      setDescription("");
      setUrl("");
      setAttachmentUrl("");
      setIconUrl("");
      setSelectedTags([]);
      setIsVisible(true);
    }
    setErrors({});
    setUploadedFile(null);
    setUploadPreview("");
    setImageError(false);
    setLogoSource("url");
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (file: File) => {
    const maxSize = 1.5 * 1024 * 1024; // 1.5MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, upload: "Formato não suportado. Use PNG, JPG, WEBP ou SVG." }));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, upload: "Arquivo muito grande. Máximo 1.5MB." }));
      return;
    }

    setUploadedFile(file);
    setErrors(prev => ({ ...prev, upload: "" }));
    
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

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      let finalIconUrl = iconUrl.trim() || undefined;

      // If uploading a file, upload to storage first
      if (logoSource === "upload" && uploadedFile) {
        setUploading(true);
        try {
          // Generate temporary ID for new tools
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

      await onSave({
        ...(tool?.id && { id: tool.id }),
        name: name.trim(),
        description: description.trim(),
        url: url.trim() || undefined,
        attachment_url: attachmentUrl.trim() || undefined,
        icon_url: finalIconUrl,
        tags: selectedTags,
        is_visible: isVisible,
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
            <Label htmlFor="attachmentUrl">Anexo (URL para Download)</Label>
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
                {errors.upload && (
                  <p className="text-sm text-destructive">{errors.upload}</p>
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
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving || uploading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {uploading ? "Enviando imagem..." : saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
