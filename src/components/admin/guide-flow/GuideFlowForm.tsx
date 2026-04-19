import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { TIPOS_GUIA, CATEGORIAS, INTENCOES, CATEGORIAS_PUBLICAS, mapInternaToPublica } from '@/lib/guide-editorial-options';

export interface GuideFlowInputs {
  tema: string;
  tipo: string;
  categoria: string;          // Categoria Interna
  categoriaPublica: string;   // Categoria Pública (badge visual)
  palavraChave: string;
  intencao: string;
  contextoAdicional: string;
  visualMode: 'generate' | 'prompt_only';
}

interface Props {
  onGenerate: (inputs: GuideFlowInputs) => void;
  isGenerating: boolean;
}

export function GuideFlowForm({ onGenerate, isGenerating }: Props) {
  const [inputs, setInputs] = useState<GuideFlowInputs>({
    tema: '',
    tipo: '',
    categoria: '',
    categoriaPublica: '',
    palavraChave: '',
    intencao: '',
    contextoAdicional: '',
    visualMode: 'generate',
  });

  // Sugere automaticamente a Categoria Pública quando a Interna muda (admin pode trocar)
  const handleCategoriaInternaChange = (v: string) => {
    setInputs((p) => ({
      ...p,
      categoria: v,
      categoriaPublica: p.categoriaPublica || mapInternaToPublica(v),
    }));
  };

  const canSubmit = inputs.tema.trim() && inputs.categoria && inputs.categoriaPublica && !isGenerating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) onGenerate(inputs);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="tema">Tema do guia *</Label>
        <Input
          id="tema"
          placeholder="Ex: Como organizar uma rotina de estudos para concursos"
          value={inputs.tema}
          onChange={(e) => setInputs((p) => ({ ...p, tema: e.target.value }))}
          className="rounded-[var(--admin-radius)]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tipo de guia</Label>
          <Select value={inputs.tipo} onValueChange={(v) => setInputs((p) => ({ ...p, tipo: v }))}>
            <SelectTrigger className="rounded-[var(--admin-radius)]">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_GUIA.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Categoria *</Label>
          <Select value={inputs.categoria} onValueChange={(v) => setInputs((p) => ({ ...p, categoria: v }))}>
            <SelectTrigger className="rounded-[var(--admin-radius)]">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="palavraChave">Palavra-chave principal</Label>
          <Input
            id="palavraChave"
            placeholder="Ex: rotina de estudos"
            value={inputs.palavraChave}
            onChange={(e) => setInputs((p) => ({ ...p, palavraChave: e.target.value }))}
            className="rounded-[var(--admin-radius)]"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Intenção do conteúdo</Label>
          <Select value={inputs.intencao} onValueChange={(v) => setInputs((p) => ({ ...p, intencao: v }))}>
            <SelectTrigger className="rounded-[var(--admin-radius)]">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {INTENCOES.map((i) => (
                <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contexto">Contexto adicional / biblioteca</Label>
        <Textarea
          id="contexto"
          placeholder="Cole aqui referências, notas, regras editoriais específicas ou qualquer contexto relevante para este guia..."
          value={inputs.contextoAdicional}
          onChange={(e) => setInputs((p) => ({ ...p, contextoAdicional: e.target.value }))}
          rows={4}
          className="rounded-[var(--admin-radius)]"
        />
        <p className="text-xs text-muted-foreground">Opcional. Informações extras que a IA deve considerar na geração.</p>
      </div>

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-[var(--admin-radius)] gap-2"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Gerando guia...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Gerar guia assistido
          </>
        )}
      </Button>
    </form>
  );
}
