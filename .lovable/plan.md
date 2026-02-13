```md
# Plano: Migrar useTools para React Query + defaults globais de cache (com ajustes de refetch)

## Confirmações dos 4 pontos (mantidas)

1. **Versão TanStack Query**: o projeto usa `@tanstack/react-query ^5.83.0` — **v5 confirmada**, portanto `gcTime` é o campo correto.

2. **queryKey estável**: tags serão ordenadas (`[...tags].sort().join(',')`) antes de compor a key. O hook atual não tem `search`, então a key será: `['tools_public', page, pageSize, sortedTagsString]` para público e `['tools_admin']` para admin.

3. **Sem skeleton ao voltar**: usaremos `isLoading` (false quando há cache) para skeleton, e `placeholderData: keepPreviousData` para paginação. `isFetching` não afetará a UI.

4. **Invalidation por prefixo**: todas as mutations invalidarão `{ queryKey: ['tools_public'] }` e `{ queryKey: ['tools_admin'] }` (prefix match por padrão no v5).

---

## Ajustes adicionais (importante para não “congelar” dados stale)

### 5) **Não usar `refetchOnMount: false` no default global**
Com `staleTime` de 5 minutos, já teremos cache imediato ao voltar rapidamente.
Se mantivermos **`refetchOnMount: false` + `refetchOnWindowFocus: false`**, quando o dado ficar stale, ele pode **não atualizar ao remontar**, e o usuário pode ficar vendo dado antigo até uma invalidação ocorrer.

✅ Portanto, no default global:
- **Remover `refetchOnMount`** (deixar comportamento padrão)
  **ou**
- Definir `refetchOnMount: true`

**Escolha recomendada:** **remover `refetchOnMount` do default** (menos agressivo e mais seguro).

---

## Arquivos a alterar

### 1. `src/App.tsx` (linha 68)

Adicionar `defaultOptions` ao `QueryClient`:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      // refetchOnMount: REMOVIDO (ou usar true) para não travar atualização quando stale
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

```

> Observação: manter `refetchOnWindowFocus: false` é ok para reduzir ruído; a atualização quando stale ocorrerá no mount (comportamento padrão) e também em ações que invalidem cache.

---

### 2. `src/hooks/useTools.tsx` (reescrita completa)

Migrar de `useState/useEffect` para `useQuery` + `useQueryClient`:

- **Leitura pública**: `useQuery` com key `['tools_public', page, pageSize, sortedTags]`, `placeholderData: keepPreviousData`
- **Leitura admin**: `useQuery` com key `['tools_admin']`, overrides estritos (`staleTime: 0, refetchOnMount: true, refetchOnWindowFocus: true`)
- **Mutations** (add/update/delete/toggleVisible/reorder): funções async que chamam edge function e depois `queryClient.invalidateQueries({ queryKey: ['tools_public'] })` + `['tools_admin']`
- **Reorder**: manter optimistic update via `queryClient.setQueryData` com rollback
- **Interface pública mantida**: `tools, total, loading, page, pageSize, totalPages, addTool, updateTool, deleteTool, toggleVisible, reorderTools, refetch`
- `loading` mapeado para `isLoading` (false quando cache existe)

#### Checks adicionais (para evitar fetch indevido/erros)

- Garantir que query **admin** rode apenas quando estiver em modo admin e com permissão (usar `enabled` conforme o modo).
- Se a área admin tiver paginação/filtros no futuro, considerar key admin mais específica; se não tiver, `['tools_admin']` está ok.

---

### 3. `src/hooks/useConcursosAdmin.tsx`

Adicionar overrides nas queries `concursos-pending-items` e `concursos-analyzed-urls`:

```ts
staleTime: 0,
refetchOnMount: true,
refetchOnWindowFocus: true,

```

---

### 4. `src/hooks/useOportunidades.tsx`

Adicionar overrides na query `oportunidades-admin`:

```ts
staleTime: 0,
refetchOnMount: true,
refetchOnWindowFocus: true,

```

A query pública `oportunidades-public` herda defaults globais (5min stale).

---

### 5. `src/hooks/useCurations.tsx`

Adicionar overrides nas queries admin (`curationKeys.list` e `curationKeys.detail`):

```ts
staleTime: 0,
refetchOnMount: true,
refetchOnWindowFocus: true,

```

A query pública `curationKeys.bySlug` herda defaults globais.

---

## Resultado esperado

- `/ferramentas`: primeira visita faz fetch normal com skeleton. Navegar para outra página e voltar em menos de 5 minutos mostra dados do cache instantaneamente (sem skeleton).
- Quando o cache ficar stale (após 5 min), ao voltar para a rota, a lista **continua aparecendo** (sem skeleton) e atualiza em background quando necessário.
- Paginação e filtros: transição suave com `keepPreviousData`, sem piscar.
- Admin/premium: continuam com refetch estrito (staleTime 0, refetchOnMount true, refetchOnWindowFocus true).
- Nenhuma mudança de UI, rotas, layout ou lógica de negócio.