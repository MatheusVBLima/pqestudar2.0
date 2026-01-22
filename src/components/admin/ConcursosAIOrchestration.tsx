import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Save, Bot, AlertCircle } from "lucide-react";
import { useAIOrchestrationConfig, AIOrchestrationConfig } from "@/hooks/useConcursosAdmin";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AI_FUNCTIONS = [
  { id: "classify", label: "Classificar conteúdo", description: "Determina categoria e tipo" },
  { id: "extractFields", label: "Extrair campos", description: "Extrai órgão, banca, situação, datas" },
  { id: "generateSummary", label: "Gerar resumo editorial", description: "Cria texto informativo" },
  { id: "suggestTags", label: "Sugerir tags", description: "Sugere escolaridade, abrangência" },
  { id: "evaluateReliability", label: "Avaliar confiabilidade", description: "Pontua a fonte" },
] as const;

export default function ConcursosAIOrchestration() {
  const { config, setConfig, resetConfig } = useAIOrchestrationConfig();

  const updateConfig = (updates: Partial<AIOrchestrationConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const toggleFunction = (funcId: keyof AIOrchestrationConfig["enabledFunctions"]) => {
    updateConfig({
      enabledFunctions: {
        ...config.enabledFunctions,
        [funcId]: !config.enabledFunctions[funcId],
      },
    });
  };

  const handleSave = () => {
    toast.success("Configurações de IA salvas!");
  };

  const isAIEnabled = config.engine !== "manual";
  const hasEnabledFunctions = Object.values(config.enabledFunctions).some(Boolean);

  return (
    <div className="space-y-6">
      {/* Engine Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Motor de IA
          </CardTitle>
          <CardDescription>
            Selecione o motor de IA a ser utilizado. Padrão: Manual (sem IA)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Motor</Label>
            <Select
              value={config.engine}
              onValueChange={(value: AIOrchestrationConfig["engine"]) =>
                updateConfig({ engine: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">
                  <span className="flex items-center gap-2">
                    Manual (sem IA)
                    <Badge variant="secondary" className="text-xs">Padrão</Badge>
                  </span>
                </SelectItem>
                <SelectItem value="lovable">Lovable IA</SelectItem>
                <SelectItem value="openai">ChatGPT (OpenAI)</SelectItem>
                <SelectItem value="other" disabled>Outro (em breve)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.engine === "manual" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No modo manual, todos os campos devem ser preenchidos pelo administrador.
                A IA não será utilizada para classificação ou extração de dados.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Functions */}
      <Card className={!isAIEnabled ? "opacity-50" : ""}>
        <CardHeader>
          <CardTitle className="text-base">Funções Permitidas</CardTitle>
          <CardDescription>
            Selecione quais funções a IA pode executar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {AI_FUNCTIONS.map((func) => (
              <div
                key={func.id}
                className="flex items-start space-x-3 rounded-lg border p-3"
              >
                <Checkbox
                  id={func.id}
                  checked={config.enabledFunctions[func.id as keyof typeof config.enabledFunctions]}
                  onCheckedChange={() =>
                    toggleFunction(func.id as keyof typeof config.enabledFunctions)
                  }
                  disabled={!isAIEnabled}
                />
                <div className="flex-1">
                  <Label htmlFor={func.id} className="text-sm font-medium cursor-pointer">
                    {func.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{func.description}</p>
                </div>
              </div>
            ))}

            {isAIEnabled && !hasEnabledFunctions && (
              <p className="text-sm text-amber-600">
                ⚠️ Nenhuma função habilitada. A IA não executará nenhuma ação.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Base Prompt */}
      <Card className={!isAIEnabled ? "opacity-50" : ""}>
        <CardHeader>
          <CardTitle className="text-base">Prompt Base</CardTitle>
          <CardDescription>
            Instruções e regras que serão enviadas para a IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={config.basePrompt}
            onChange={(e) => updateConfig({ basePrompt: e.target.value })}
            rows={8}
            placeholder="Instruções para a IA..."
            disabled={!isAIEnabled}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Use linguagem clara e objetiva. A IA seguirá estas instruções ao processar cada item.
          </p>
        </CardContent>
      </Card>

      {/* Limits */}
      <Card className={!isAIEnabled ? "opacity-50" : ""}>
        <CardHeader>
          <CardTitle className="text-base">Limites de Execução</CardTitle>
          <CardDescription>
            Configure limites para controlar custos e tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Máx. tokens por item</Label>
              <Input
                type="number"
                value={config.maxTokensPerItem}
                onChange={(e) =>
                  updateConfig({ maxTokensPerItem: parseInt(e.target.value) || 1000 })
                }
                min={100}
                max={4000}
                disabled={!isAIEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Máx. itens por rodada</Label>
              <Input
                type="number"
                value={config.maxItemsPerRound}
                onChange={(e) =>
                  updateConfig({ maxItemsPerRound: parseInt(e.target.value) || 10 })
                }
                min={1}
                max={50}
                disabled={!isAIEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Timeout (ms)</Label>
              <Input
                type="number"
                value={config.timeoutMs}
                onChange={(e) =>
                  updateConfig({ timeoutMs: parseInt(e.target.value) || 30000 })
                }
                min={5000}
                max={120000}
                step={1000}
                disabled={!isAIEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fallback info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fallback em Caso de Falha</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Se a IA falhar ou atingir o timeout, o item será marcado como{" "}
              <Badge variant="outline" className="mx-1">pendente</Badge>
              e exigirá revisão manual. <strong>Itens com falha de IA nunca são publicados automaticamente.</strong>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={resetConfig}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar Padrões
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}