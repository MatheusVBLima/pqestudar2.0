import { useState, useEffect, useRef, memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { TIPOS_GUIA, CATEGORIAS, INTENCOES } from '@/lib/guide-editorial-options';
import type { GuideFlowInputs } from '../GuideFlowForm';

function InputNodeComponent({ data }: { data: any }) {
  const { onGenerate, isGenerating, hasValidSources, hasLibrary, selectedLibrary, onAutoSuggest, onInputsChange } = data;
  const [inputs, setInputs] = useState<GuideFlowInputs>({
    tema: '', tipo: '', categoria: '', palavraChave: '', intencao: '', contextoAdicional: '',
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Notify parent of input changes for editorial summary
  useEffect(() => {
    onInputsChange?.(inputs);
  }, [inputs, onInputsChange]);

  // Auto-suggest library when tema or palavraChave changes
  useEffect(() => {
    if (!onAutoSuggest) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (inputs.tema.trim() || inputs.palavraChave.trim()) {
        onAutoSuggest(inputs.tema, inputs.palavraChave);
      }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputs.tema, inputs.palavraChave, onAutoSuggest]);

  const canSubmit = inputs.tema.trim() && inputs.categoria && !isGenerating;

  return (
    <div className="bg-card border-2 border-primary/40 rounded-[1.2rem] shadow-card w-[400px] overflow-hidden">
      <Handle type="target" position={Position.Left} className="!bg-primary !w-3 !h-3 !border-2 !border-card" />

      <div className="bg-primary/10 px-4 py-2.5 border-b border-primary/20 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Dados Iniciais</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Source status indicators */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted">
            {hasValidSources ? (
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
            )}
            <span>Diretrizes</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted">
            {hasLibrary ? (
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
            )}
            <span className="truncate max-w-[120px]">{selectedLibrary ? selectedLibrary : 'Biblioteca'}</span>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Tema do guia *</Label>
          <Input
            placeholder="Ex: Como organizar uma rotina de estudos"
            value={inputs.tema}
            onChange={(e) => setInputs((p) => ({ ...p, tema: e.target.value }))}
            className="rounded-lg text-xs h-8"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Tipo de guia</Label>
            <Select value={inputs.tipo} onValueChange={(v) => setInputs((p) => ({ ...p, tipo: v }))}>
              <SelectTrigger className="rounded-lg text-xs h-8"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {TIPOS_GUIA.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Categoria *</Label>
            <Select value={inputs.categoria} onValueChange={(v) => setInputs((p) => ({ ...p, categoria: v }))}>
              <SelectTrigger className="rounded-lg text-xs h-8"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Palavra-chave</Label>
            <Input
              placeholder="Ex: rotina de estudos"
              value={inputs.palavraChave}
              onChange={(e) => setInputs((p) => ({ ...p, palavraChave: e.target.value }))}
              className="rounded-lg text-xs h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Intenção</Label>
            <Select value={inputs.intencao} onValueChange={(v) => setInputs((p) => ({ ...p, intencao: v }))}>
              <SelectTrigger className="rounded-lg text-xs h-8"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {INTENCOES.map((i) => (
                  <SelectItem key={i.value} value={i.value} className="text-xs">{i.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Contexto adicional</Label>
          <Textarea
            placeholder="Referências, regras editoriais..."
            value={inputs.contextoAdicional}
            onChange={(e) => setInputs((p) => ({ ...p, contextoAdicional: e.target.value }))}
            rows={2}
            className="rounded-lg text-xs resize-none"
          />
        </div>

        <Button
          onClick={() => canSubmit && onGenerate(inputs)}
          disabled={!canSubmit}
          className="w-full rounded-lg gap-2 h-9 text-xs"
          size="sm"
        >
          {isGenerating ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Gerando...</>
          ) : (
            <><Sparkles className="h-3.5 w-3.5" /> Gerar guia assistido</>
          )}
        </Button>

        {!hasLibrary && !hasValidSources && !isGenerating && (
          <p className="text-[10px] text-amber-600 text-center">
            ⚠ Sem fontes da Biblioteca — sincronize o Storage primeiro
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3 !border-2 !border-primary-foreground" />
    </div>
  );
}

export const InputNode = memo(InputNodeComponent);
