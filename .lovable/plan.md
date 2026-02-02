
## Plano: Adicionar script UTMify no HEAD da rota /mapa-dos-beneficios

### Objetivo
Adicionar o script de rastreamento de UTMs do UTMify no `<head>` da página `/mapa-dos-beneficios`, usando o `react-helmet` já existente no projeto.

---

### Arquivo a modificar
- `src/pages/MapaDosBeneficios.tsx`

---

### Implementação

Vou adicionar uma tag `<script>` dentro do componente `<Helmet>` existente (linhas 1380-1384):

**Antes:**
```tsx
<Helmet>
  <title>Oferta Especial: O Mapa dos Benefícios Ocultos</title>
  <meta name="description" content="..." />
  <meta name="robots" content="index, follow" />
</Helmet>
```

**Depois:**
```tsx
<Helmet>
  <title>Oferta Especial: O Mapa dos Benefícios Ocultos</title>
  <meta name="description" content="..." />
  <meta name="robots" content="index, follow" />
  <script
    src="https://cdn.utmify.com.br/scripts/utms/latest.js"
    data-utmify-prevent-xcod-sck
    data-utmify-prevent-subids
    async
    defer
  />
</Helmet>
```

---

### Detalhes técnicos
- O `react-helmet` injeta elementos no `<head>` do documento
- Atributos `async` e `defer` garantem carregamento não-bloqueante
- Os data-attributes `data-utmify-prevent-xcod-sck` e `data-utmify-prevent-subids` serão preservados conforme enviado
- **Nenhum outro script/pixel será alterado ou removido** (Meta Pixel, Google Analytics continuam intactos)

---

### Escopo
- ✅ Apenas a rota `/mapa-dos-beneficios` será modificada
- ✅ Script inserido no HEAD via react-helmet
- ✅ Não afeta outras rotas, layout global, ou tracking existente

---

### Validação
1. Inspecionar a página `/mapa-dos-beneficios` no navegador
2. Verificar que o `<script>` aparece no `<head>` com os atributos corretos
3. Confirmar que UTMs são capturados pelo UTMify (verificar console/network)
