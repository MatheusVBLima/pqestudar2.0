import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FolderOpen, Bookmark, GraduationCap, Trash2, Calendar, ChevronDown, ChevronRight, Edit2, Share, MoreVertical, Move } from "lucide-react";
import useFavoritos from "@/hooks/useFavoritos";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const FavoritosNovo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pastas, favoritos, criarPasta, editarPasta, excluirPasta, removerFavorito, moverItem, getFavoritosPorPasta } = useFavoritos();
  const [novaPastaNome, setNovaPastaNome] = useState("");
  const [novaPastaCor, setNovaPastaCor] = useState("#8B5CF6");
  const [pastaExpandida, setPastaExpandida] = useState<string | null>("default");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [pastaEditando, setPastaEditando] = useState<{id: string, nome: string, cor: string} | null>(null);
  const [dialogMoverAberto, setDialogMoverAberto] = useState(false);
  const [itemMovendo, setItemMovendo] = useState<{id: number, tipo: "noticia" | "curso"} | null>(null);

  const cores = [
    "#8B5CF6", "#EF4444", "#10B981", "#F59E0B", 
    "#3B82F6", "#EC4899", "#6366F1", "#84CC16"
  ];

  const handleCriarPasta = () => {
    if (novaPastaNome.trim()) {
      criarPasta(novaPastaNome.trim(), novaPastaCor);
      setNovaPastaNome("");
      setNovaPastaCor("#8B5CF6");
      setDialogAberto(false);
      toast({
        title: "Pasta criada!",
        description: `A pasta "${novaPastaNome}" foi criada com sucesso.`
      });
    }
  };

  const togglePasta = (pastaId: string) => {
    setPastaExpandida(pastaExpandida === pastaId ? null : pastaId);
  };

  const handleRemoverItem = (id: number, tipo: "noticia" | "curso") => {
    removerFavorito(id, tipo);
    toast({
      title: "Item removido",
      description: `O ${tipo} foi removido dos seus favoritos.`
    });
  };

  const handleEditarPasta = (pasta: {id: string, nome: string, cor: string}) => {
    setPastaEditando(pasta);
    setDialogEditarAberto(true);
  };

  const handleSalvarEdicao = () => {
    if (pastaEditando) {
      editarPasta(pastaEditando.id, pastaEditando.nome, pastaEditando.cor);
      setDialogEditarAberto(false);
      setPastaEditando(null);
      toast({
        title: "Pasta editada!",
        description: "As alterações foram salvas com sucesso."
      });
    }
  };

  const handleExcluirPasta = (pastaId: string, pastaNome: string) => {
    if (pastaId === "default") {
      toast({
        title: "Ação não permitida",
        description: "Não é possível excluir a pasta padrão.",
        variant: "destructive"
      });
      return;
    }
    
    excluirPasta(pastaId);
    toast({
      title: "Pasta excluída",
      description: `A pasta "${pastaNome}" foi excluída. Os itens foram movidos para "Meus Favoritos".`
    });
  };

  const handleMoverItem = (itemId: number, tipo: "noticia" | "curso") => {
    setItemMovendo({ id: itemId, tipo });
    setDialogMoverAberto(true);
  };

  const handleConfirmarMover = (novaPastaId: string) => {
    if (itemMovendo) {
      moverItem(itemMovendo.id, itemMovendo.tipo, novaPastaId);
      setDialogMoverAberto(false);
      setItemMovendo(null);
      const pasta = pastas.find(p => p.id === novaPastaId);
      toast({
        title: "Item movido",
        description: `O item foi movido para "${pasta?.nome}".`
      });
    }
  };

  const handleCompartilhar = async (item: any) => {
    const url = item.tipo === "noticia" 
      ? `${window.location.origin}/noticia/${item.id}`
      : `${window.location.origin}/curso/${item.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência."
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Minha Atividade
          </h1>
          <p className="text-lg text-muted-foreground">
            Organize suas notícias e cursos favoritos em pastas personalizadas.
          </p>
        </div>

        {/* Botão para criar pasta */}
        <div className="mb-6">
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Pasta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Pasta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Pasta</Label>
                  <Input
                    id="nome"
                    value={novaPastaNome}
                    onChange={(e) => setNovaPastaNome(e.target.value)}
                    placeholder="Ex: Cursos de Programação"
                  />
                </div>
                <div>
                  <Label>Cor da Pasta</Label>
                  <div className="flex gap-2 mt-2">
                    {cores.map((cor) => (
                      <button
                        key={cor}
                        className={`w-8 h-8 rounded-full border-2 ${
                          novaPastaCor === cor ? "border-foreground" : "border-transparent"
                        }`}
                        style={{ backgroundColor: cor }}
                        onClick={() => setNovaPastaCor(cor)}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleCriarPasta} className="w-full">
                  Criar Pasta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Pastas */}
        <div className="space-y-4">
          {pastas.map((pasta) => {
            const itensPasta = getFavoritosPorPasta(pasta.id);
            const isExpandida = pastaExpandida === pasta.id;

            return (
              <Card key={pasta.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => togglePasta(pasta.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpandida ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: pasta.cor }}
                      />
                      <div>
                        <CardTitle className="text-lg">{pasta.nome}</CardTitle>
                        <CardDescription>
                          {itensPasta.length} {itensPasta.length === 1 ? "item" : "itens"}
                        </CardDescription>
                      </div>
                    </div>
                    {pasta.id !== "default" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditarPasta(pasta);
                          }}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar pasta
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExcluirPasta(pasta.id, pasta.nome);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir pasta
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>

                {isExpandida && (
                  <CardContent className="pt-0">
                    {itensPasta.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bookmark className="h-8 w-8 mx-auto mb-2" />
                        <p>Nenhum item salvo nesta pasta ainda.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {itensPasta.map((item) => (
                          <div key={`${item.tipo}-${item.id}`} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {item.tipo === "noticia" ? (
                                    <Bookmark className="h-4 w-4 text-blue-500" />
                                  ) : (
                                    <GraduationCap className="h-4 w-4 text-green-500" />
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {item.categoria}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {item.tipo === "noticia" ? "Notícia" : "Curso"}
                                  </Badge>
                                </div>
                                <h4 className="font-medium mb-1">{item.titulo}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.descricao}
                                </p>
                                {item.tipo === "noticia" && "data" in item && (
                                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(item.data).toLocaleDateString('pt-BR')}
                                  </div>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (item.tipo === "noticia") {
                                        navigate(`/noticia/${item.id}`);
                                      } else {
                                        navigate(`/curso/${item.id}`);
                                      }
                                    }}
                                  >
                                    <Bookmark className="h-4 w-4 mr-2" />
                                    Ver item
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMoverItem(item.id, item.tipo)}>
                                    <Move className="h-4 w-4 mr-2" />
                                    Mover para pasta
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleCompartilhar(item)}>
                                    <Share className="h-4 w-4 mr-2" />
                                    Compartilhar link
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleRemoverItem(item.id, item.tipo)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remover
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {pastas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-semibold mb-2">
              Nenhuma pasta criada ainda
            </h2>
            <p className="text-muted-foreground mb-6">
              Crie sua primeira pasta para organizar seus favoritos.
            </p>
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Pasta
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}

        {/* Dialog para editar pasta */}
        <Dialog open={dialogEditarAberto} onOpenChange={setDialogEditarAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Pasta</DialogTitle>
            </DialogHeader>
            {pastaEditando && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome-editar">Nome da Pasta</Label>
                  <Input
                    id="nome-editar"
                    value={pastaEditando.nome}
                    onChange={(e) => setPastaEditando({...pastaEditando, nome: e.target.value})}
                    placeholder="Ex: Cursos de Programação"
                  />
                </div>
                <div>
                  <Label>Cor da Pasta</Label>
                  <div className="flex gap-2 mt-2">
                    {cores.map((cor) => (
                      <button
                        key={cor}
                        className={`w-8 h-8 rounded-full border-2 ${
                          pastaEditando.cor === cor ? "border-foreground" : "border-transparent"
                        }`}
                        style={{ backgroundColor: cor }}
                        onClick={() => setPastaEditando({...pastaEditando, cor})}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleSalvarEdicao} className="w-full">
                  Salvar Alterações
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para mover item */}
        <Dialog open={dialogMoverAberto} onOpenChange={setDialogMoverAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mover Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Escolha a pasta de destino</Label>
                <Select onValueChange={handleConfirmarMover}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma pasta" />
                  </SelectTrigger>
                  <SelectContent>
                    {pastas.map((pasta) => (
                      <SelectItem key={pasta.id} value={pasta.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: pasta.cor }}
                          />
                          {pasta.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default FavoritosNovo;