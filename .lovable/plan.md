

## Recomendação de palavras destacadas por página

Os títulos vêm do banco de dados (`page_settings`). Para destacar palavras específicas, vamos usar uma convenção simples: envolver a palavra em `**` no campo `header_title` do banco, e o `PageHero` + `HeroSection` renderizam essas palavras com o gradiente roxo da marca.

### Palavras recomendadas e justificativa

| Rota | Título atual | Palavra(s) destacada(s) | Porquê |
|------|-------------|------------------------|--------|
| `/` | Aprenda, Organize e Evolua com as Ferramentas Certas | **Evolua** | É o verbo de transformação — resume a promessa do site. Destacar os três verbos seria visual demais. |
| `/ferramentas` | Ferramentas e Plataformas Educacionais Gratuitas | **Gratuitas** | É o diferencial de valor, o que mais chama atenção do visitante. Consistente com a memória do projeto (destaque similar ao "Secretas" original). |
| `/concursos` | Concursos Públicos Abertos e Previstos | **Abertos** | Transmite urgência e ação — "está acontecendo agora". |
| `/produtos` | Guias e Soluções Criadas pelo PqEstudar | **Soluções** | É a palavra de valor/benefício — o usuário busca resolver problemas. |
| `/votacoes` | Vote nas Próximas Funcionalidades | **Próximas** | Gera expectativa e senso de participação ativa no futuro da plataforma. |
| `/premium` | Área Premium do PqEstudar | **Premium** | É a identidade da seção — reforça exclusividade. |

### Implementação técnica

**1. Convenção de marcação no banco**

Usar `**palavra**` dentro do `header_title`. Exemplo:
```
Aprenda, Organize e **Evolua** com as Ferramentas Certas
```

**2. Helper de renderização**

Criar uma função `renderHighlightedTitle(title: string)` que:
- Faz split por `**`
- Alterna entre texto normal e `<span>` com gradiente roxo
- Retorna `ReactNode[]`

```typescript
// src/lib/highlight-title.tsx
export function renderHighlightedTitle(title: string): React.ReactNode {
  const parts = title.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{part}</span>
      : part
  );
}
```

**3. Atualizar componentes**

- `PageHero.tsx`: usar `renderHighlightedTitle(title)` dentro do `<h1>` em vez de `{title}` direto.
- `hero-section.tsx`: mesma lógica no `<h1>` que renderiza `headerTitle`.

**4. Atualizar títulos no banco (6 UPDATEs)**

Inserir `**` ao redor das palavras escolhidas nos 6 registros de `page_settings`.

### Arquivos alterados
- Criar `src/lib/highlight-title.tsx`
- Editar `src/components/layout/PageHero.tsx`
- Editar `src/components/sections/hero-section.tsx`
- 6 UPDATEs no banco via migration

