

## Diagnóstico

O Google está exibindo o title e meta description **do `index.html`** (linha 8-9), não os do `page_settings` do Supabase. Isso acontece porque:

1. **`index.html` tem metadados estáticos antigos**: `"pqestudar - Cursos Gratuitos com Certificado"` e a descrição sobre "cursos online gratuitos e certificados válidos" — exatamente o que aparece no Google (imagem 1).

2. **O Helmet da página `/concursos` só renderiza após a query ao Supabase** (`{ps.isReady && <Helmet>...`). O Googlebot (que renderiza SPAs) pode não esperar tempo suficiente para a query resolver, então usa o fallback do HTML estático.

3. **Isso afeta TODAS as rotas**, não só `/concursos`. Qualquer crawler que não espere o Supabase verá os metadados antigos do `index.html`.

## Plano de correção

### 1. Atualizar metadados estáticos do `index.html`

Trocar o title e description genéricos por valores que representem melhor a home (`/`), já que é o fallback global:

- Title: valor alinhado com o que está no `page_settings` da home
- Description: idem
- OG tags: alinhar também

### 2. Remover o guard `ps.isReady` do Helmet em `/concursos`

Atualmente: `{ps.isReady && <Helmet>...}`  
Corrigir para: renderizar o `<Helmet>` **sempre**, usando os fallbacks imediatos que `usePageSettings` já fornece (`titleTag` e `metaDescription` retornam valores mesmo durante loading). Isso garante que o `<title>` existe no DOM desde o primeiro render.

### 3. Auditar e corrigir o mesmo padrão em todas as páginas

Verificar todas as páginas que usam `usePageSettings` + `Helmet` com o guard `isReady` e remover o guard, permitindo render imediato com fallback.

### Detalhes técnicos

- **`usePageSettings`** já retorna fallbacks (`FALLBACK.title_tag`, etc.) quando `data` é null — o guard `isReady` é redundante e prejudicial para SEO.
- A mudança é de baixo risco: o texto simplesmente aparece com o fallback primeiro e atualiza silenciosamente quando a query resolve (o Helmet faz merge, não flash).
- Arquivos a editar:
  - `index.html` — atualizar title, description, og:title, og:description
  - `src/pages/Concursos.tsx` — remover `{ps.isReady && ...}` do Helmet
  - Qualquer outra página com o mesmo padrão

