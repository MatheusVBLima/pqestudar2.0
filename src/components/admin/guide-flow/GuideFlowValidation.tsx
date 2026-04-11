import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedGuideData } from './GuideFlowPreview';

type Status = 'ok' | 'warn' | 'error';

interface ValidationItem {
  label: string;
  status: Status;
  detail?: string;
}

function getValidations(data: GeneratedGuideData): ValidationItem[] {
  const items: ValidationItem[] = [];

  // Title
  if (!data.title.trim()) {
    items.push({ label: 'Título', status: 'error', detail: 'Obrigatório' });
  } else if (data.title.length > 80) {
    items.push({ label: 'Título', status: 'warn', detail: `${data.title.length} chars (ideal < 80)` });
  } else {
    items.push({ label: 'Título', status: 'ok' });
  }

  // Slug
  if (!data.slug.trim()) {
    items.push({ label: 'Slug', status: 'error', detail: 'Obrigatório' });
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    items.push({ label: 'Slug', status: 'warn', detail: 'Caracteres inválidos' });
  } else {
    items.push({ label: 'Slug', status: 'ok' });
  }

  // Short description
  if (!data.short_description.trim()) {
    items.push({ label: 'Descrição curta', status: 'error', detail: 'Obrigatória' });
  } else if (data.short_description.length > 160) {
    items.push({ label: 'Descrição curta', status: 'warn', detail: `${data.short_description.length}/160` });
  } else {
    items.push({ label: 'Descrição curta', status: 'ok' });
  }

  // SEO Title
  if (!data.seo_title.trim()) {
    items.push({ label: 'SEO Title', status: 'warn', detail: 'Recomendado' });
  } else if (data.seo_title.length > 60) {
    items.push({ label: 'SEO Title', status: 'warn', detail: `${data.seo_title.length}/60` });
  } else {
    items.push({ label: 'SEO Title', status: 'ok' });
  }

  // SEO Description
  if (!data.seo_description.trim()) {
    items.push({ label: 'SEO Description', status: 'warn', detail: 'Recomendada' });
  } else if (data.seo_description.length > 160) {
    items.push({ label: 'SEO Description', status: 'warn', detail: `${data.seo_description.length}/160` });
  } else {
    items.push({ label: 'SEO Description', status: 'ok' });
  }

  // Content
  const wordCount = data.content_markdown.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 50) {
    items.push({ label: 'Conteúdo', status: 'error', detail: `${wordCount} palavras (mínimo 50)` });
  } else if (wordCount < 300) {
    items.push({ label: 'Conteúdo', status: 'warn', detail: `${wordCount} palavras (ideal > 300)` });
  } else {
    items.push({ label: 'Conteúdo', status: 'ok', detail: `${wordCount} palavras` });
  }

  // H2 check
  const h2Count = (data.content_markdown.match(/^## /gm) || []).length;
  if (h2Count === 0) {
    items.push({ label: 'Seções H2', status: 'warn', detail: 'Nenhuma encontrada' });
  } else {
    items.push({ label: 'Seções H2', status: 'ok', detail: `${h2Count} seções` });
  }

  // CTAs
  const ctaCount = [data.cta_top, data.cta_middle, data.cta_final].filter(Boolean).length;
  if (ctaCount === 0) {
    items.push({ label: 'CTAs', status: 'warn', detail: 'Nenhuma CTA configurada' });
  } else if (ctaCount < 2) {
    items.push({ label: 'CTAs', status: 'warn', detail: `${ctaCount}/3 configurada(s)` });
  } else {
    items.push({ label: 'CTAs', status: 'ok', detail: `${ctaCount}/3` });
  }

  // Links
  if (data.internal_links.length === 0) {
    items.push({ label: 'Links úteis', status: 'warn', detail: 'Nenhum link adicionado' });
  } else {
    const valid = data.internal_links.filter((l) => l.label.trim() && l.url.trim()).length;
    items.push({ label: 'Links úteis', status: valid === data.internal_links.length ? 'ok' : 'warn', detail: `${valid}/${data.internal_links.length} completos` });
  }

  // Category
  if (!data.category.trim()) {
    items.push({ label: 'Categoria', status: 'error', detail: 'Obrigatória' });
  } else {
    items.push({ label: 'Categoria', status: 'ok' });
  }

  return items;
}

const statusIcon = {
  ok: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  warn: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
};

interface Props {
  data: GeneratedGuideData;
}

export function GuideFlowValidation({ data }: Props) {
  const items = getValidations(data);
  const errors = items.filter((i) => i.status === 'error').length;
  const warnings = items.filter((i) => i.status === 'warn').length;
  const oks = items.filter((i) => i.status === 'ok').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Info className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">Validação</span>
      </div>

      {/* Summary */}
      <div className="flex gap-3 text-xs">
        <span className="flex items-center gap-1 text-emerald-600">
          <CheckCircle2 className="h-3 w-3" /> {oks}
        </span>
        <span className="flex items-center gap-1 text-amber-600">
          <AlertTriangle className="h-3 w-3" /> {warnings}
        </span>
        <span className="flex items-center gap-1 text-red-600">
          <XCircle className="h-3 w-3" /> {errors}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
              item.status === 'error' && 'bg-red-500/5',
              item.status === 'warn' && 'bg-amber-500/5',
            )}
          >
            {statusIcon[item.status]}
            <span className="flex-1 font-medium">{item.label}</span>
            {item.detail && (
              <span className="text-xs text-muted-foreground">{item.detail}</span>
            )}
          </div>
        ))}
      </div>

      {errors > 0 && (
        <p className="text-xs text-red-500">
          Corrija os itens obrigatórios antes de salvar.
        </p>
      )}
    </div>
  );
}

export function hasValidationErrors(data: GeneratedGuideData): boolean {
  return !data.title.trim() || !data.slug.trim() || !data.short_description.trim() || !data.category.trim() ||
    data.content_markdown.trim().split(/\s+/).filter(Boolean).length < 50;
}
