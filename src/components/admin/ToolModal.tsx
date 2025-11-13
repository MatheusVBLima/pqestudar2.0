import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tool } from "@/hooks/useTools";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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
  const [iconUrl, setIconUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tool) {
      setName(tool.name);
      setDescription(tool.description);
      setUrl(tool.url || "");
      setIconUrl(tool.icon_url || "");
      setSelectedTags(tool.tags || []);
      setIsVisible(tool.is_visible);
    } else {
      setName("");
      setDescription("");
      setUrl("");
      setIconUrl("");
      setSelectedTags([]);
      setIsVisible(true);
    }
    setErrors({});
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

    if (selectedTags.length === 0) {
      newErrors.tags = "Selecione pelo menos uma categoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave({
        ...(tool?.id && { id: tool.id }),
        name: name.trim(),
        description: description.trim(),
        url: url.trim() || undefined,
        icon_url: iconUrl.trim() || undefined,
        tags: selectedTags,
        is_visible: isVisible,
      });
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
            <Label htmlFor="iconUrl">URL do Ícone/Logo</Label>
            <Input
              id="iconUrl"
              type="url"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
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
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
