import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/dashboard/PageHeader';
import { FlowCanvas } from '@/components/admin/guide-flow/FlowCanvas';
import { EditorialSummaryPanel } from '@/components/admin/guide-flow/EditorialSummaryPanel';
import type { GeneratedGuideData, ImagePrompt } from '@/components/admin/guide-flow/GuideFlowPreview';
import type { GuideFlowInputs } from '@/components/admin/guide-flow/GuideFlowForm';
import { hasValidationErrors } from '@/components/admin/guide-flow/GuideFlowValidation';
import { findOption, TIPOS_GUIA, CATEGORIAS, INTENCOES } from '@/lib/guide-editorial-options';
import { useGuidesMutations } from '@/hooks/useGuides';
import { useGuideFlowSources } from '@/hooks/useGuideFlowSources';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Save, Send, RotateCcw } from 'lucide-react';

const EMPTY_GUIDE: GeneratedGuideData = {
  title: '', slug: '', short_description: '', seo_title: '', seo_description: '',
  category: '', author_name: 'Matheus Dias', content_markdown: '',
  cta_top: null, cta_middle: null, cta_final: null, internal_links: [], cover_image_suggestion: '',
  image_prompts: [], generated_images: [],
};

export default function GuideFlow() {
  const navigate = useNavigate();
  const { createGuide } = useGuidesMutations();
  const sources = useGuideFlowSources();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [guideData, setGuideData] = useState<GeneratedGuideData | null>(null);
  const [currentInputs, setCurrentInputs] = useState<GuideFlowInputs>({
    tema: '', tipo: '', categoria: '', palavraChave: '', intencao: '', contextoAdicional: '',
  });

  const handleInputsChange = useCallback((inputs: GuideFlowInputs) => {
    setCurrentInputs(inputs);
  }, []);

  const handleGenerate = useCallback(async (inputs: GuideFlowInputs) => {
    setIsGenerating(true);
    sources.autoSuggest(inputs.tema, inputs.palavraChave);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Sessão expirada', description: 'Faça login novamente.', variant: 'destructive' });
        return;
      }

      // Build context from active Biblioteca entries
      const structureContext = sources.activeStructureEntries
        .map(e => `[Diretriz: ${e.title}]\n${e.content}`)
        .join('\n\n---\n\n');

      const libraryContext = sources.activeLibraryEntries
        .map(e => `[Biblioteca: ${e.title}]\n${e.content}`)
        .join('\n\n---\n\n');

      const selectedLibraryName = sources.activeLibraryEntries.length > 0
        ? sources.activeLibraryEntries.map(e => e.title).join(', ')
        : null;

      // Resolve editorial metadata for the prompt
      const tipoOption = findOption(TIPOS_GUIA, inputs.tipo);
      const categoriaOption = findOption(CATEGORIAS, inputs.categoria);
      const intencaoOption = findOption(INTENCOES, inputs.intencao);

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide-flow-generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({
            ...inputs,
            selectedLibrary: selectedLibraryName,
            structureContext,
            libraryContext,
            // Send structured editorial metadata
            editorialMeta: {
              tipo: tipoOption ? {
                label: tipoOption.label,
                meaning: tipoOption.editorialMeaning,
                impact: tipoOption.generationImpact,
              } : null,
              categoria: categoriaOption ? {
                label: categoriaOption.label,
                context: categoriaOption.editorialContext,
                impact: categoriaOption.generationImpact,
              } : null,
              intencao: intencaoOption ? {
                label: intencaoOption.label,
                impact: intencaoOption.generationImpact,
              } : null,
            },
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Erro desconhecido' }));
        toast({ title: 'Erro na geração', description: err.error, variant: 'destructive' });
        return;
      }

      const generated = await resp.json();

      setGuideData({
        title: generated.title ?? '',
        slug: generated.slug ?? '',
        short_description: generated.short_description ?? '',
        seo_title: generated.seo_title ?? '',
        seo_description: generated.seo_description ?? '',
        category: generated.category ?? (categoriaOption?.label || inputs.categoria),
        author_name: generated.author_name ?? 'Matheus Dias',
        content_markdown: generated.content_markdown ?? '',
        cta_top: generated.cta_top ?? null,
        cta_middle: generated.cta_middle ?? null,
        cta_final: generated.cta_final ?? null,
        internal_links: generated.internal_links ?? [],
        cover_image_suggestion: generated.cover_image_suggestion ?? '',
        cover_image_url: generated.cover_image_url ?? '',
        image_prompts: generated.image_prompts ?? [],
        generated_images: generated.generated_images ?? [],
      });

      const hasLib = sources.activeLibraryEntries.length > 0;
      const hasStruct = sources.activeStructureEntries.length > 0;
      toast({
        title: 'Guia gerado com sucesso',
        description: hasLib && hasStruct
          ? `Gerado com ${sources.activeStructureEntries.length} diretriz(es) e ${sources.activeLibraryEntries.length} biblioteca(s).`
          : hasStruct
            ? 'Gerado com diretrizes editoriais — sem biblioteca factual.'
            : 'Gerado sem fontes da Biblioteca — revisão manual recomendada.',
      });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [sources.activeStructureEntries, sources.activeLibraryEntries, sources.autoSuggest]);

  const handleRegenerateImage = useCallback(async (prompt: string, position: string) => {
    if (!guideData) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      toast({ title: 'Regenerando imagem...', description: `Posição: ${position}` });

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide-flow-generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({
            action: 'regenerate-image',
            prompt,
            position,
            slug: guideData.slug,
          }),
        }
      );

      // For now, we use a simplified approach - call the image API directly via a dedicated mechanism
      // The edge function handles image generation internally during guide generation
      // For regeneration, we update the prompt and re-trigger
      toast({ title: 'Use o prompt copiado', description: 'Cole o prompt em uma ferramenta de geração de imagem e atualize manualmente.', });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  }, [guideData]);

  const handleUpdateImagePrompt = useCallback((position: string, newPrompt: string) => {
    if (!guideData) return;
    const updateList = (list: ImagePrompt[] | undefined) =>
      (list ?? []).map(img => img.position === position ? { ...img, prompt: newPrompt } : img);
    setGuideData({
      ...guideData,
      image_prompts: updateList(guideData.image_prompts),
      generated_images: updateList(guideData.generated_images),
    });
    toast({ title: 'Prompt atualizado', description: `Posição: ${position}` });
  }, [guideData]);

  /** Inject internal images into the markdown content at their correct positions */
  const buildFinalMarkdown = (data: GeneratedGuideData): string => {
    const internalImages = (data.generated_images ?? data.image_prompts ?? [])
      .filter(img => img.type === 'internal' && img.status === 'success' && img.url);

    if (internalImages.length === 0) return data.content_markdown;

    // Parse positions like "after_section_1", "after_section_2" etc.
    const imagesBySection = new Map<number, typeof internalImages>();
    for (const img of internalImages) {
      const match = img.position?.match(/after_section_(\d+)/);
      const sectionIndex = match ? parseInt(match[1], 10) : null;
      if (sectionIndex !== null) {
        const list = imagesBySection.get(sectionIndex) || [];
        list.push(img);
        imagesBySection.set(sectionIndex, list);
      }
    }

    if (imagesBySection.size === 0) {
      // No positional info — append all at the end
      const suffix = internalImages
        .map(img => `\n\n<img src="${img.url}" alt="${img.alt_text || ''}" width="100%" loading="lazy" decoding="async" />\n`)
        .join('');
      return data.content_markdown + suffix;
    }

    // Split markdown by H2 headings to identify sections
    const lines = data.content_markdown.split('\n');
    const sections: { startLine: number; endLine: number }[] = [];
    let currentStart = -1;

    for (let i = 0; i < lines.length; i++) {
      if (/^##\s/.test(lines[i])) {
        if (currentStart >= 0) {
          sections.push({ startLine: currentStart, endLine: i - 1 });
        }
        currentStart = i;
      }
    }
    if (currentStart >= 0) {
      sections.push({ startLine: currentStart, endLine: lines.length - 1 });
    }

    // Build result by inserting images after the corresponding sections
    const result = [...lines];
    // Process in reverse order so line insertions don't shift indices
    const sortedSections = Array.from(imagesBySection.entries()).sort((a, b) => b[0] - a[0]);

    for (const [sectionIndex, images] of sortedSections) {
      const section = sections[sectionIndex - 1]; // 1-indexed
      if (!section) continue;

      const imgTags = images
        .map(img => `<img src="${img.url}" alt="${img.alt_text || ''}" width="100%" loading="lazy" decoding="async" />`)
        .join('\n\n');

      result.splice(section.endLine + 1, 0, '', imgTags, '');
    }

    return result.join('\n');
  };

  const handleSave = async (publish: boolean) => {
    if (!guideData) return;
    if (hasValidationErrors(guideData)) {
      toast({ title: 'Erros de validação', description: 'Corrija os campos obrigatórios antes de salvar.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const finalMarkdown = buildFinalMarkdown(guideData);

      await createGuide.mutateAsync({
        title: guideData.title,
        slug: guideData.slug,
        short_description: guideData.short_description,
        seo_title: guideData.seo_title,
        seo_description: guideData.seo_description,
        category: guideData.category,
        author_name: guideData.author_name,
        content_markdown: finalMarkdown,
        cover_image_url: guideData.cover_image_url || null,
        internal_code: `FLOW-${Date.now()}`,
        is_published: publish,
        is_featured: false,
        sort_order: 0,
        internal_links: guideData.internal_links,
        cta_top_label: guideData.cta_top?.label || null,
        cta_top_url: guideData.cta_top?.url || null,
        cta_top_text: guideData.cta_top?.text || null,
        cta_middle_label: guideData.cta_middle?.label || null,
        cta_middle_url: guideData.cta_middle?.url || null,
        cta_middle_text: guideData.cta_middle?.text || null,
        cta_final_label: guideData.cta_final?.label || null,
        cta_final_url: guideData.cta_final?.url || null,
        cta_final_text: guideData.cta_final?.text || null,
      });
      toast({
        title: publish ? 'Guia publicado!' : 'Rascunho salvo!',
        description: `"${guideData.title}" foi ${publish ? 'publicado' : 'salvo como rascunho'}.`,
      });
      navigate('/guias');
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setGuideData(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Fluxo de Guias"
          description="Criação assistida com base na Biblioteca de Conhecimento."
        />
        <div className="flex items-center gap-2">
          {guideData && (
            <>
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 rounded-[var(--admin-radius)]">
                <RotateCcw className="h-3.5 w-3.5" /> Recomeçar
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={isSaving} className="gap-1.5 rounded-[var(--admin-radius)]">
                <Save className="h-3.5 w-3.5" /> Rascunho
              </Button>
              <Button size="sm" onClick={() => handleSave(true)} disabled={isSaving} className="gap-1.5 rounded-[var(--admin-radius)]">
                <Send className="h-3.5 w-3.5" /> Publicar
              </Button>
            </>
          )}
        </div>
      </div>

      <FlowCanvas
        guideData={guideData}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
        onGuideDataChange={setGuideData}
        sources={sources}
        onInputsChange={handleInputsChange}
        onRegenerateImage={handleRegenerateImage}
        onUpdateImagePrompt={handleUpdateImagePrompt}
      />

      <EditorialSummaryPanel
        tipo={currentInputs.tipo}
        categoria={currentInputs.categoria}
        intencao={currentInputs.intencao}
        activeStructureCount={sources.activeStructureEntries.length}
        totalStructureCount={sources.structureEntries.length}
        activeLibraryNames={sources.activeLibraryEntries.map(e => e.title)}
        selectionMode={sources.selectionMode}
      />
    </div>
  );
}
