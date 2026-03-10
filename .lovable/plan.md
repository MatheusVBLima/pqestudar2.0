
## Diagnóstico do Problema

O `tailwind.config.ts` tem um bug de posicionamento: o bloco `boxShadow` está com indentação incorreta — ele foi inserido **fora** do bloco `extend`, em vez de dentro. Isso faz com que o Tailwind ignore ou trate incorretamente o token `shadow-card`.

### Estrutura atual (com bug):

```
theme: {
  extend: {
    colors: { ... },
    backgroundImage: { ... },
  // ← indentação quebrada aqui
  boxShadow: {           <-- FORA do extend
    'card': '...',
  },
    transitionTimingFunction: { ... },  <-- voltou para dentro
```

Quando `boxShadow` fica fora de `extend`, ele substitui o sistema completo de sombras do Tailwind em vez de adicionar ao existente — e pode ser ignorado por parsers dependendo da versão.

### Solução

**1. Corrigir `tailwind.config.ts`**: mover `boxShadow` para dentro de `theme.extend` com indentação correta, garantindo que `shadow-card` seja gerado como utilidade Tailwind válida.

**2. Garantir aplicação em `src/components/ui/card.tsx`**: o `<Card />` base já tem `shadow-card` na classe padrão — isso está correto e não precisa mudar.

**3. Verificar `src/pages/Ferramentas.tsx`**: o `SortableToolCard` usa `<Card className="h-full shadow-card ...">` — isso está correto. Com o config corrigido, o `shadow-card` passará a ser uma utilidade válida reconhecida pelo Tailwind e será aplicado.

### O que será alterado

| Arquivo | Mudança |
|---|---|
| `tailwind.config.ts` | Mover `boxShadow` para dentro de `theme.extend` com indentação correta |

### O que NÃO será alterado

- Nenhuma página além das 3 rotas afetadas indiretamente pelo token
- Nenhuma lógica, rota, menu ou componente de negócio
- Nenhum novo efeito visual além da sombra já especificada
- O valor do shadow permanece exatamente: `0 4px 10px hsl(240 30% 25% / 0.12)`

### Por que só o config precisa mudar?

O `card.tsx` e `Ferramentas.tsx` já estão corretos — eles usam `shadow-card`. O problema é que a classe `shadow-card` não existe de fato no CSS gerado porque o token está mal posicionado no config. Corrigindo o config, a classe passa a existir e os arquivos já a consomem corretamente.

---

## Performance Guardrails — Home `/` (Sprint 2)

### Regras anti-regressão (o que NÃO pode voltar)

1. **Scripts síncronos no `<head>`**: Meta Pixel e qualquer outro terceiro devem ser adiados via `requestIdleCallback` ou `setTimeout`. NUNCA inserir `<script>` síncrono que bloqueie render.

2. **Framer-motion no elemento LCP**: O `<h1>` da hero-section NÃO pode ter animação framer-motion (motion.h1). Animações atrasam o primeiro paint do LCP.

3. **Importar rotas estaticamente em App.tsx**: Apenas `Index` (home) é importado estaticamente. Todas as demais rotas DEVEM usar `React.lazy()`.

4. **Skeleton no H1 da hero**: O `<h1>` DEVE renderizar imediatamente com texto de fallback. NUNCA mostrar Skeleton no lugar do H1 — isso atrasa o LCP.

5. **Below-fold na home sem lazy**: Seções abaixo da dobra (`DualTrackSection`, `HomeProductsSection`, etc.) DEVEM ser lazy-loaded via `React.lazy` + `Suspense`.

### Checklist de release para Home `/` (5 itens)

- [ ] H1 renderiza no primeiro paint (sem skeleton, sem esperar rede)
- [ ] Nenhum `<script>` síncrono no `<head>` (exceto stub inline mínimo)
- [ ] Seções below-fold usam `React.lazy`
- [ ] Imagens na navbar têm `width`/`height` explícitos
- [ ] Cookie banner usa `position: fixed` + `contain: layout` (sem CLS)

### Limites operacionais

| Métrica | Limite |
|---|---|
| Chunk inicial (JS) | Deve conter apenas: React, Router, Home, Navbar, Hero |
| Scripts terceiros na primeira dobra | 0 (todos adiados) |
| Imagens acima da dobra sem dimensões | 0 |
| Animações no elemento LCP | 0 |

### Baseline registrada

| Métrica | Sprint 0 (antes) | Sprint 1 (depois) | Meta |
|---|---|---|---|
| LCP (lab) | 6.6s | — (medir) | ≤ 2.5s |
| FCP (lab) | 4.6s | — (medir) | ≤ 1.8s |
| TTFB (lab) | 2.0s | — (infra) | ≤ 0.8s |
| CLS (campo) | 0.13 | — (medir) | ≤ 0.1 |
| TBT (lab) | 100ms | — (medir) | ≤ 200ms |
