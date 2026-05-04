import { useState, useEffect } from "react";
import { PageHeader } from "@/components/admin/dashboard/PageHeader";
import { useAllPageSettings, MANAGED_ROUTES, type PageSettings } from "@/hooks/usePageSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Save, AlertTriangle } from "lucide-react";
import { getErrorMessage } from "@/lib/error-message";

export default function AdminPages() {
  const { allSettings, isLoading, updateSettings, isUpdating } = useAllPageSettings();
  const [selectedRoute, setSelectedRoute] = useState<string>(MANAGED_ROUTES[0]);

  // Form state
  const [titleTag, setTitleTag] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerDescription, setHeaderDescription] = useState("");

  // Load form when route changes
  useEffect(() => {
    const found = allSettings.find((s) => s.route === selectedRoute);
    if (found) {
      setTitleTag(found.title_tag);
      setMetaDescription(found.meta_description);
      setHeaderTitle(found.header_title);
      setHeaderDescription(found.header_description);
    }
  }, [selectedRoute, allSettings]);

  const canSave =
    titleTag.trim() !== "" &&
    metaDescription.trim() !== "" &&
    headerTitle.trim() !== "" &&
    headerDescription.trim() !== "";

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await updateSettings({
        route: selectedRoute,
        title_tag: titleTag.trim(),
        meta_description: metaDescription.trim(),
        header_title: headerTitle.trim(),
        header_description: headerDescription.trim(),
      });
      toast({ title: "Salvo com sucesso", description: `Configurações de ${selectedRoute} atualizadas.` });
    } catch (err: unknown) {
      toast({ title: "Erro ao salvar", description: getErrorMessage(err, "Tente novamente."), variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Page Settings" description="Gerencie título, meta description e hero de cada página." />
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Page Settings" description="Gerencie título, meta description e hero de cada página." />

      {/* Route selector */}
      <div className="max-w-xs">
        <Label className="text-sm font-medium mb-2 block">Rota</Label>
        <Select value={selectedRoute} onValueChange={setSelectedRoute}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MANAGED_ROUTES.map((route) => (
              <SelectItem key={route} value={route}>
                {route}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          {/* Title tag */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title_tag">Title tag</Label>
              <div className="flex items-center gap-2">
                {titleTag.length > 60 && (
                  <Badge variant="outline" className="text-destructive border-destructive/30 gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {titleTag.length}/60
                  </Badge>
                )}
                {titleTag.length <= 60 && (
                  <span className="text-xs text-muted-foreground">{titleTag.length}/60</span>
                )}
              </div>
            </div>
            <Input
              id="title_tag"
              value={titleTag}
              onChange={(e) => setTitleTag(e.target.value)}
              placeholder="Ex: Ferramentas - PqEstudar"
            />
          </div>

          {/* Meta description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="meta_description">Meta description</Label>
              <div className="flex items-center gap-2">
                {metaDescription.length > 160 && (
                  <Badge variant="outline" className="text-destructive border-destructive/30 gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {metaDescription.length}/160
                  </Badge>
                )}
                {metaDescription.length <= 160 && (
                  <span className="text-xs text-muted-foreground">{metaDescription.length}/160</span>
                )}
              </div>
            </div>
            <Textarea
              id="meta_description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Descrição para mecanismos de busca"
              rows={3}
            />
          </div>

          {/* Header title (H1) */}
          <div className="space-y-2">
            <Label htmlFor="header_title">Header title (H1 do hero)</Label>
            <Input
              id="header_title"
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              placeholder="Ex: Ferramentas"
            />
          </div>

          {/* Header description */}
          <div className="space-y-2">
            <Label htmlFor="header_description">Header description (texto abaixo do H1)</Label>
            <Textarea
              id="header_description"
              value={headerDescription}
              onChange={(e) => setHeaderDescription(e.target.value)}
              placeholder="Ex: A curadoria completa das ferramentas..."
              rows={3}
            />
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={!canSave || isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
