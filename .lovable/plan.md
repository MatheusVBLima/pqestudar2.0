

## Diagnóstico

Das 4 páginas mencionadas, 3 já foram corrigidas no Sprint anterior (`/ferramentas`, `/concursos`, `/votacoes`). Apenas **`/produtos`** ainda tem o guard `psReady` bloqueando o `<Helmet>`.

## Correção

**Arquivo: `src/pages/Produtos.tsx`** (linhas 540-545)

Remover o guard `{psReady && (...)}` e renderizar o `<Helmet>` sempre — os fallbacks do `usePageSettings` já garantem valores imediatos:

```tsx
// DE:
{psReady && (
  <Helmet>
    <title>{titleTag}</title>
    <meta name="description" content={metaDescription} />
  </Helmet>
)}

// PARA:
<Helmet>
  <title>{titleTag}</title>
  <meta name="description" content={metaDescription} />
</Helmet>
```

Isso é tudo. As outras 3 páginas já estão corretas.

