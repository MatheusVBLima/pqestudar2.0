import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Sparkles, Loader2, X, Check, AlertTriangle, ArrowRight, Equal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { type EditorField } from '@/lib/audit-editor-profiles';
import { type ClassifiedIssue } from '@/lib/issue-applicability';
import { cn } from '@/lib/utils';

type AIProvider = 'lovable' | 'openai';

interface FieldSuggestion {
  key: string;
  label: string;
  current: string;
  suggested: string;
  changed: boolean;
}

interface SuggestionsResult {
  fieldSuggestions: FieldSuggestion[];
  reasoning?: string;
  unresolvedIssues: ClassifiedIssue[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  path: string;
  profileKey: string;
  fields: EditorField[];
  currentValues: Record<string, string>;
  classifiedIssues: ClassifiedIssue[];
  onApply: (updates: Record<string, string>, appliedLabels: string[]) => void;
}

export function AISuggestionsPanel({
  open,
  onClose,
  path,
  profileKey,
  fields,
  currentValues,
  classifiedIssues,
  onApply,
}: Props) {
  const [provider, setProvider] = useState<AIProvider>('lovable');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SuggestionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const autoIssues = useMemo(() => classifiedIssues.filter(i => i.applicability === 'auto'), [classifiedIssues]);
  const manualIssues = useMemo(() => classifiedIssues.filter(i => i.applicability !== 'auto'), [classifiedIssues]);

  const changedSuggestions = useMemo(() => result?.fieldSuggestions.filter(s => s.changed) ?? [], [result]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const fieldsPayload = fields.map(f => ({
        key: f.key,
        label: f.label,
        value: currentValues[f.key] ?? '',
        maxLength: f.maxLength,
        warnLength: f.warnLength,
      }));

      const issuesPayload = autoIssues.map(i => ({
        issue: i.issue,
        category: i.category,
        evidence: i.evidence,
        fix: i.fix,
      }));

      const { data, error: fnError } = await supabase.functions.invoke('generate-copy-suggestions', {
        body: {
          url: path,
          fields: fieldsPayload,
          issues: issuesPayload,
          profileKey,
          provider,
        },
      });

      if (fnError) throw new Error(fnError.message || 'Erro ao gerar sugestões');
      if (!data?.suggestions) throw new Error('Resposta inválida do serviço de IA');

      const suggestions = data.suggestions as Record<string, string>;
      const fieldSuggestions: FieldSuggestion[] = fields.map(f => {
        const current = (currentValues[f.key] ?? '').trim();
        const suggested = (suggestions[f.key] ?? '').trim();
        return {
          key: f.key,
          label: f.label,
          current,
          suggested: suggested || current,
          changed: !!suggested && suggested !== current,
        };
      });

      if (import.meta.env.DEV) {
        console.log('[AI Panel] Provider:', provider);
        console.log('[AI Panel] Suggestions:', suggestions);
        console.log('[AI Panel] Changed:', fieldSuggestions.filter(s => s.changed).map(s => s.key));
      }

      setResult({
        fieldSuggestions,
        reasoning: data.reasoning,
        unresolvedIssues: manualIssues,
      });
    } catch (err: any) {
      console.error('[AI Panel] Error:', err);
      const msg = err.message || 'Erro ao gerar sugestões';
      setError(msg);

      // Fallback: if OpenAI failed, suggest Lovable AI
      if (provider === 'openai') {
        setError(`${msg}\n\nTente novamente com Lovable AI.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    const updates: Record<string, string> = {};
    const labels: string[] = [];
    for (const s of changedSuggestions) {
      updates[s.key] = s.suggested;
      labels.push(s.label);
    }
    onApply(updates, labels);
    toast.success(`${labels.length} campo(s) preenchido(s) no editor. Revise e clique em "Salvar nova versão".`);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-[460px] max-w-full bg-background border-l shadow-xl z-50 flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Correção automática</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Pré-visualize as sugestões antes de aplicar no editor.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5">
        {/* Provider selector */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Provedor de IA</Label>
          <Select value={provider} onValueChange={(v) => setProvider(v as AIProvider)} disabled={isGenerating}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lovable">Lovable AI (padrão)</SelectItem>
              <SelectItem value="openai">OpenAI (config do sistema)</SelectItem>
            </SelectContent>
          </Select>
          {provider === 'openai' && (
            <p className="text-[11px] text-muted-foreground">
              Usa a API Key configurada em Supabase Secrets (OPENAI_API_KEY).
            </p>
          )}
        </div>

        {/* Issues summary */}
        {classifiedIssues.length > 0 && (
          <div className="rounded-lg border p-3 space-y-2 text-xs">
            <p className="font-medium text-sm">Issues do diagnóstico</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-primary" />
                {autoIssues.length} auto-aplicável(is)
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                {manualIssues.length} manual(is)
              </span>
            </div>
            {autoIssues.length === 0 && (
              <p className="text-muted-foreground italic">
                Nenhuma issue pode ser corrigida automaticamente com os campos disponíveis.
              </p>
            )}
          </div>
        )}

        {/* Manual issues detail */}
        {manualIssues.length > 0 && !result && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2 text-xs">
            <p className="font-medium text-amber-600">Issues estruturais/manuais</p>
            <p className="text-muted-foreground">
              Estas issues não podem ser resolvidas por IA neste editor:
            </p>
            <ul className="space-y-1 text-muted-foreground">
              {manualIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{issue.issue} — <em>{issue.reason}</em></span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Generating skeleton */}
        {isGenerating && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando sugestões com {provider === 'lovable' ? 'Lovable AI' : 'OpenAI'}…
            </div>
            {fields.map(f => (
              <div key={f.key} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && !isGenerating && (
          <div className="space-y-4">
            {result.reasoning && (
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Raciocínio da IA</p>
                {result.reasoning}
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium">
                Pré-visualização ({changedSuggestions.length} alteração(ões))
              </p>
              {changedSuggestions.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  A IA analisou os campos, mas os textos sugeridos são idênticos aos atuais. Nenhuma alteração necessária.
                </p>
              )}
            </div>

            {/* Changed fields first */}
            {result.fieldSuggestions
              .sort((a, b) => (a.changed === b.changed ? 0 : a.changed ? -1 : 1))
              .map(s => (
                <FieldDiff key={s.key} suggestion={s} />
              ))}

            {/* Unresolved issues */}
            {result.unresolvedIssues.length > 0 && (
              <>
                <Separator />
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2 text-xs">
                  <p className="font-medium text-amber-600">
                    {result.unresolvedIssues.length} issue(s) não resolvida(s)
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    {result.unresolvedIssues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{issue.issue} — <em>{issue.reason}</em></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-4 flex items-center gap-2 shrink-0">
        <Button variant="outline" onClick={onClose} className="flex-1" disabled={isGenerating}>
          Fechar
        </Button>
        {!result ? (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || autoIssues.length === 0}
            className="flex-1"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            {isGenerating ? 'Gerando…' : 'Gerar sugestões'}
          </Button>
        ) : (
          <Button
            onClick={handleApply}
            disabled={changedSuggestions.length === 0}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-1" />
            Aplicar no editor ({changedSuggestions.length})
          </Button>
        )}
      </div>
    </div>
  );
}

function FieldDiff({ suggestion }: { suggestion: FieldSuggestion }) {
  const [expanded, setExpanded] = useState(suggestion.changed);

  return (
    <div className={cn(
      'rounded-lg border p-3 space-y-2 text-xs transition-colors',
      suggestion.changed ? 'border-primary/30' : 'border-muted'
    )}>
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-medium text-sm">{suggestion.label}</span>
        <div className="flex items-center gap-1.5">
          {suggestion.changed ? (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">
              Alterado
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
              <Equal className="h-3 w-3 mr-0.5" />
              Igual
            </Badge>
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-2 pt-1">
          <div className="rounded bg-destructive/10 p-2.5">
            <span className="font-medium text-destructive mr-1.5">Atual</span>
            <span className="text-foreground">{suggestion.current || '(vazio)'}</span>
          </div>
          {suggestion.changed && (
            <>
              <div className="flex justify-center">
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="rounded bg-emerald-500/10 p-2.5">
                <span className="font-medium text-emerald-600 mr-1.5">Sugestão</span>
                <span className="text-foreground">{suggestion.suggested}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
