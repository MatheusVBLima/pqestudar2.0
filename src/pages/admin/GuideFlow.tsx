import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/admin/dashboard/PageHeader';
import { GuideFlowForm, type GuideFlowInputs } from '@/components/admin/guide-flow/GuideFlowForm';
import { GuideFlowPreview, type GeneratedGuideData } from '@/components/admin/guide-flow/GuideFlowPreview';
import { GuideFlowValidation, hasValidationErrors } from '@/components/admin/guide-flow/GuideFlowValidation';
import { useGuidesMutations } from '@/hooks/useGuides';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Save, Send, ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';

const EMPTY_GUIDE: GeneratedGuideData = {
  title: '',
  slug: '',
  short_description: '',
  seo_title: '',
  seo_description: '',
  category: '',
  author_name: 'Equipe PqEstudar',
  content_markdown: '',
  cta_top: null,
  cta_middle: null,
  cta_final: null,
  internal_links: [],
  cover_image_suggestion: '',
};

export default function GuideFlow() {
  const navigate = useNavigate();
  const { createGuide } = useGuidesMutations();

  const [step, setStep] = useState<'input' | 'review'>('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [guideData, setGuideData] = useState<GeneratedGuideData>(EMPTY_GUIDE);

  const handleGenerate = async (inputs: GuideFlowInputs) => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: 'Sessão expirada', description: 'Faça login novamente.', variant: 'destructive' });
        return;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide-flow-generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(inputs),
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
        category: generated.category ?? inputs.categoria,
        author_name: generated.author_name ?? 'Equipe PqEstudar',
        content_markdown: generated.content_markdown ?? '',
        cta_top: generated.cta_top ?? null,
        cta_middle: generated.cta_middle ?? null,
        cta_final: generated.cta_final ?? null,
        internal_links: generated.internal_links ?? [],
        cover_image_suggestion: generated.cover_image_suggestion ?? '',
      });

      setStep('review');
      toast({ title: 'Guia gerado com sucesso', description: 'Revise o conteúdo antes de salvar.' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (hasValidationErrors(guideData)) {
      toast({ title: 'Erros de validação', description: 'Corrija os campos obrigatórios antes de salvar.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const guidePayload: any = {
        title: guideData.title,
        slug: guideData.slug,
        short_description: guideData.short_description,
        seo_title: guideData.seo_title,
        seo_description: guideData.seo_description,
        category: guideData.category,
        author_name: guideData.author_name,
        content_markdown: guideData.content_markdown,
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
      };

      await createGuide.mutateAsync(guidePayload);
      toast({
        title: publish ? 'Guia publicado!' : 'Rascunho salvo!',
        description: `O guia "${guideData.title}" foi ${publish ? 'publicado' : 'salvo como rascunho'}.`,
      });
      navigate('/guias');
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fluxo de Guias"
        description="Criação assistida de guias com IA — gere, revise e publique em minutos."
      />

      {step === 'input' ? (
        <Card className="rounded-[var(--admin-radius)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Dados iniciais</h2>
              <Badge variant="secondary" className="text-xs">Fase 1</Badge>
            </div>
            <GuideFlowForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('input')}
                className="gap-1 rounded-[var(--admin-radius)]"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setGuideData(EMPTY_GUIDE); setStep('input'); }}
                  className="gap-1 rounded-[var(--admin-radius)]"
                >
                  <RotateCcw className="h-3 w-3" /> Recomeçar
                </Button>
              </div>
            </div>

            <Card className="rounded-[var(--admin-radius)]">
              <CardContent className="pt-6">
                <GuideFlowPreview data={guideData} onChange={setGuideData} />
              </CardContent>
            </Card>

            {/* Save actions */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="gap-2 rounded-[var(--admin-radius)]"
              >
                <Save className="h-4 w-4" />
                Salvar como rascunho
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="gap-2 rounded-[var(--admin-radius)]"
              >
                <Send className="h-4 w-4" />
                Criar e publicar
              </Button>
            </div>
          </div>

          {/* Validation sidebar */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card className="rounded-[var(--admin-radius)]">
              <CardContent className="pt-4 pb-4">
                <GuideFlowValidation data={guideData} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
