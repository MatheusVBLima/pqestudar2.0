

## Problema

O FAQ usa `<button>` dentro do `AccordionTrigger` do Radix UI. O motor de auditoria coleta **todos os `<button>`** fora de nav/header/footer como CTAs. Resultado: perguntas do FAQ ("O que é o PqEstudar…", "Preciso pagar…") aparecem como CTAs fracos.

## Solução

Adicionar ao filtro `isInsideNavOrFooter` a detecção de **accordion containers** — elementos com `data-state` (atributo do Radix Accordion) ou role `region`/`tablist`. Também filtrar botões cujo `data-radix-collection-item` exista (atributo interno do Radix AccordionTrigger).

### Alteração em `src/lib/iframe-audit-engine.ts`

Renomear o helper para `isNonConversionElement` e expandir a lógica:

```typescript
const isNonConversionElement = (el: Element): boolean => {
  // Skip nav/header/footer
  let parent = el.parentElement;
  while (parent) {
    const tag = parent.tagName?.toLowerCase();
    if (tag === 'nav' || tag === 'footer' || tag === 'header') return true;
    // Skip accordion containers (Radix UI)
    if (parent.hasAttribute('data-orientation') && parent.hasAttribute('data-state')) return true;
    parent = parent.parentElement;
  }
  // Skip Radix accordion triggers directly
  if (el.hasAttribute('data-radix-collection-item')) return true;
  return false;
};
```

Usar esse helper nos dois loops existentes (`ctaButtons` e `ctaPositions`).

Arquivo alterado: apenas `src/lib/iframe-audit-engine.ts`.

