import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Globe, Search, FileText, ExternalLink, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSearchConfig } from "@/hooks/useConcursosAdmin";
import { useQuery } from "@tanstack/react-query";

type ColetaMethod = "crawler" | "busca" | "manual";
type ColetaStatus = "pronto" | "coletando" | "concluido" | "falhou";

interface ColetaResult {
  url: string;
  dominio: string;
  status: "novo" | "ignorado" | "erro";
  motivo?: string;
  textoLength?: number;
}

interface ColetaSummary {
  total: number;
  novos: number;
  ignorados: number;
  erros: number;
}

export default function ConcursosColeta() {
  const { config: searchConfig } = useSearchConfig();
  const [method, setMethod] = useState<ColetaMethod>("crawler");
  const [status, setStatus] = useState<ColetaStatus>("pronto");
  
  // Crawler options
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [depth, setDepth] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [ignoreAnalyzed, setIgnoreAnalyzed] = useState(true);
  const [ignoreNoDate, setIgnoreNoDate] = useState(true);
  const [ignoreOutOfYear, setIgnoreOutOfYear] = useState(true);
  
  // Busca options
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLimit, setSearchLimit] = useState(20);
  
  // Manual options
  const [manualUrls, setManualUrls] = useState("");
  const [metaObs, setMetaObs] = useState("");
  
  // Target year
  const [anoAlvo, setAnoAlvo] = useState(new Date().getFullYear());
  
  // Results
  const [results, setResults] = useState<ColetaResult[]>([]);
  const [summary, setSummary] = useState<ColetaSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch existing items count
  const { data: existingCount, refetch: refetchCount } = useQuery({
    queryKey: ["itens-brutos-count", anoAlvo],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("itens_brutos")
        .select("*", { count: "exact", head: true })
        .eq("ano_alvo", anoAlvo)
        .eq("status", "novo");
      
      if (error) throw error;
      return count || 0;
    }
  });

  const whitelist = searchConfig.whitelist || [];

  const handleSiteToggle = (site: string) => {
    setSelectedSites(prev => 
      prev.includes(site) 
        ? prev.filter(s => s !== site) 
        : [...prev, site]
    );
  };

  const selectAllSites = () => setSelectedSites([...whitelist]);
  const clearAllSites = () => setSelectedSites([]);

  const executeColeta = async () => {
    setStatus("coletando");
    setResults([]);
    setSummary(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Sessão expirada. Faça login novamente.");
        setStatus("falhou");
        return;
      }

      let payload: Record<string, unknown> = {
        action: method,
        anoAlvo,
        ignoreAnalyzed,
        ignoreNoDate,
        ignoreOutOfYear,
      };

      if (method === "crawler") {
        if (selectedSites.length === 0) {
          toast.error("Selecione pelo menos um site da whitelist.");
          setStatus("pronto");
          return;
        }
        payload = {
          ...payload,
          sites: selectedSites,
          depth,
          limit: pageLimit,
        };
      } else if (method === "busca") {
        if (selectedSites.length === 0) {
          toast.error("Selecione pelo menos um site para busca.");
          setStatus("pronto");
          return;
        }
        payload = {
          ...payload,
          sites: selectedSites,
          query: searchQuery,
          limit: searchLimit,
        };
      } else if (method === "manual") {
        const urls = manualUrls
          .split("\n")
          .map(u => u.trim())
          .filter(u => u.startsWith("http"));
        
        if (urls.length === 0) {
          toast.error("Cole pelo menos uma URL válida (http/https).");
          setStatus("pronto");
          return;
        }
        payload = {
          ...payload,
          urls,
          metaObs,
        };
      }

      console.debug("[Coleta UI] Executing:", { method, ...payload });

      const response = await fetch(
        `https://omkxiomwzbykmqttfozi.supabase.co/functions/v1/concursos-coleta`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na coleta");
      }

      setResults(data.results || []);
      setSummary(data.summary || null);
      setStatus("concluido");
      refetchCount();

      if (data.summary) {
        toast.success(`Coleta concluída: ${data.summary.novos} novos, ${data.summary.ignorados} ignorados, ${data.summary.erros} erros`);
      }
    } catch (error) {
      console.error("[Coleta UI] Error:", error);
      toast.error(error instanceof Error ? error.message : "Erro na coleta");
      setStatus("falhou");
    }
  };

  const paginatedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(results.length / itemsPerPage);

  const getStatusIcon = (s: "novo" | "ignorado" | "erro") => {
    switch (s) {
      case "novo": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "ignorado": return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "erro": return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (s: "novo" | "ignorado" | "erro") => {
    switch (s) {
      case "novo": return <Badge variant="default" className="bg-emerald-600">Novo</Badge>;
      case "ignorado": return <Badge variant="secondary">Ignorado</Badge>;
      case "erro": return <Badge variant="destructive">Erro</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with existing count */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Coleta de Dados Brutos</h3>
          <p className="text-sm text-muted-foreground">
            Entrada de dados ANTES da IA. Não organiza, não publica.
          </p>
        </div>
        {existingCount !== undefined && (
          <Badge variant="outline" className="text-base px-3 py-1">
            {existingCount} itens novos em {anoAlvo}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Year selector */}
      <div className="flex items-center gap-4">
        <Label htmlFor="anoAlvo">Ano Alvo:</Label>
        <Select value={String(anoAlvo)} onValueChange={v => setAnoAlvo(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026, 2027].map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Method selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tipo de Coleta</CardTitle>
          <CardDescription>Selecione o método de coleta de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={method === "crawler" ? "default" : "outline"}
              onClick={() => setMethod("crawler")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              Crawler (Whitelist)
            </Button>
            <Button
              variant={method === "busca" ? "default" : "outline"}
              onClick={() => setMethod("busca")}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Busca Genérica
            </Button>
            <Button
              variant={method === "manual" ? "default" : "outline"}
              onClick={() => setMethod("manual")}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Manual (Colar URLs)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic parameters based on method */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Parâmetros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Crawler options */}
          {method === "crawler" && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Sites Permitidos (Whitelist)</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAllSites}>
                      Selecionar todos
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAllSites}>
                      Limpar
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px] bg-muted/30">
                  {whitelist.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Nenhum site na whitelist. Configure em "Config. de Busca".
                    </span>
                  ) : (
                    whitelist.map(site => (
                      <Badge
                        key={site}
                        variant={selectedSites.includes(site) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleSiteToggle(site)}
                      >
                        {site}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depth">Profundidade Máxima (1-3)</Label>
                  <Select value={String(depth)} onValueChange={v => setDepth(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Página inicial</SelectItem>
                      <SelectItem value="2">2 - Links diretos</SelectItem>
                      <SelectItem value="3">3 - 2 níveis de links</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pageLimit">Limite de páginas</Label>
                  <Input
                    id="pageLimit"
                    type="number"
                    min={1}
                    max={100}
                    value={pageLimit}
                    onChange={e => setPageLimit(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Filtros</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="ignoreAnalyzed"
                      checked={ignoreAnalyzed}
                      onCheckedChange={c => setIgnoreAnalyzed(!!c)}
                    />
                    <Label htmlFor="ignoreAnalyzed" className="font-normal">
                      Ignorar URLs já analisadas
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="ignoreNoDate"
                      checked={ignoreNoDate}
                      onCheckedChange={c => setIgnoreNoDate(!!c)}
                    />
                    <Label htmlFor="ignoreNoDate" className="font-normal">
                      Ignorar páginas sem data
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="ignoreOutOfYear"
                      checked={ignoreOutOfYear}
                      onCheckedChange={c => setIgnoreOutOfYear(!!c)}
                    />
                    <Label htmlFor="ignoreOutOfYear" className="font-normal">
                      Ignorar conteúdos fora do ano alvo
                    </Label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Busca options */}
          {method === "busca" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="searchQuery">Consulta</Label>
                <Input
                  id="searchQuery"
                  placeholder="Ex: edital 2026 estadual"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Sites Incluídos</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAllSites}>
                      Selecionar todos
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAllSites}>
                      Limpar
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px] bg-muted/30">
                  {whitelist.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Nenhum site na whitelist. Configure em "Config. de Busca".
                    </span>
                  ) : (
                    whitelist.map(site => (
                      <Badge
                        key={site}
                        variant={selectedSites.includes(site) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleSiteToggle(site)}
                      >
                        {site}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchLimit">Limite de resultados</Label>
                <Input
                  id="searchLimit"
                  type="number"
                  min={1}
                  max={50}
                  value={searchLimit}
                  onChange={e => setSearchLimit(Number(e.target.value))}
                />
              </div>
            </>
          )}

          {/* Manual options */}
          {method === "manual" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="manualUrls">URLs (uma por linha)</Label>
                <Textarea
                  id="manualUrls"
                  placeholder="https://exemplo.gov.br/edital-123&#10;https://outro.gov.br/concurso"
                  value={manualUrls}
                  onChange={e => setManualUrls(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Cole URLs válidas (http/https). Cada linha será processada individualmente.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaObs">Observação interna (opcional)</Label>
                <Input
                  id="metaObs"
                  placeholder="Ex: Indicação do usuário X"
                  value={metaObs}
                  onChange={e => setMetaObs(e.target.value)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Execute button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={executeColeta}
          disabled={status === "coletando"}
          className="gap-2"
        >
          {status === "coletando" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Coletando...
            </>
          ) : (
            "Executar Coleta"
          )}
        </Button>

        <div className="text-sm">
          {status === "pronto" && (
            <span className="text-muted-foreground">Pronto para coletar</span>
          )}
          {status === "coletando" && (
            <span className="text-primary">Processando...</span>
          )}
          {status === "concluido" && (
            <span className="text-emerald-600 dark:text-emerald-400">Concluído</span>
          )}
          {status === "falhou" && (
            <span className="text-destructive">Falhou</span>
          )}
        </div>
      </div>

      {/* Results */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resultados da Rodada</CardTitle>
              <CardDescription>
                Total: {summary.total} | 
                <span className="text-emerald-600 dark:text-emerald-400 ml-1">{summary.novos} novos</span> | 
                <span className="text-amber-600 dark:text-amber-400 ml-1">{summary.ignorados} ignorados</span> | 
                <span className="text-destructive ml-1">{summary.erros} erros</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum resultado nesta rodada.
                </p>
              ) : (
                <>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Status</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead className="hidden sm:table-cell">Domínio</TableHead>
                          <TableHead className="hidden md:table-cell">Motivo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedResults.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{getStatusIcon(r.status)}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-primary flex items-center gap-1"
                              >
                                <span className="truncate">{r.url}</span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="outline">{r.dominio}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                              {r.motivo || (r.textoLength ? `${r.textoLength} caracteres` : "-")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-muted-foreground">
                        Mostrando {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, results.length)} de {results.length}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Note about curation */}
      <p className="text-xs text-muted-foreground">
        Nota: A aba "Coleta" apenas salva matéria-prima. A curadoria, anti-repetição e IA acontecem nas abas dedicadas.
      </p>
    </div>
  );
}
