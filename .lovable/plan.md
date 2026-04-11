

## Plano: Biblioteca indexada a partir do Supabase Storage

### Contexto

A página **Biblioteca de Conhecimento** (`/admin/biblioteca`) hoje opera apenas com cadastro manual na tabela `guide_flow_knowledge`. Os buckets `guide-structure` e `guide-library` contêm arquivos reais, mas não há conexão entre eles e a Biblioteca. O objetivo é transformar a Biblioteca em uma camada indexada desses arquivos.

### Problema adicional conhecido

A leitura client-side dos buckets está bloqueada por RLS (retorna 0 arquivos). A sincronização precisa ser feita via Edge Function com service role.

---

### Fase 1 — Migração: adicionar colunas de origem na tabela

Adicionar colunas à tabela `guide_flow_knowledge` para rastrear origem Storage:

- `source_type` (`text`, default `'manual'`) — valores: `manual`, `storage`
- `source_bucket` (`text`, nullable) — ex: `guide-structure`, `guide-library`
- `source_path` (`text`, nullable) — path completo do arquivo no bucket
- `synced_at` (`timestamptz`, nullable) — data da última sincronização
- Constraint `UNIQUE(source_bucket, source_path)` para evitar duplicação

### Fase 2 — Edge Function: ação `sync` no `guide-flow-knowledge`

Adicionar ação `sync` à Edge Function existente que:

1. Lista arquivos de `guide-structure` e `guide-library` usando service role
2. Para cada arquivo encontrado:
   - Verifica se já existe entrada com mesmo `source_bucket` + `source_path`
   - Se não existe: cria entrada com `source_type = 'storage'`, título derivado do nome do arquivo, categoria inferida do bucket (`estrutura` para guide-structure, `referencia` para guide-library), conteúdo = texto extraído ou placeholder indicando que é PDF
   - Se já existe: atualiza `synced_at`
3. Retorna resumo: total encontrado, novos importados, já existentes, erros

### Fase 3 — UI: botão de sincronização e indicadores de origem

Na página `GuideFlowKnowledge.tsx`:

- Adicionar botão **"Sincronizar Storage"** ao lado de "Nova entrada"
- Cada card mostra badge de origem: `📦 Storage` ou `✍️ Manual`
- Entradas de Storage mostram bucket e path de origem
- Filtro por origem (manual / storage / todos)
- Badge de status de sincronização no topo

### Fase 4 — Consumo pelo Fluxo de Guias

Atualizar o `guide-flow-generate` para buscar entradas da `guide_flow_knowledge` com `source_type = 'storage'` como fontes primárias, em vez de ler Storage diretamente no client.

---

### Detalhes técnicos

**Migração SQL:**
```sql
ALTER TABLE guide_flow_knowledge
  ADD COLUMN source_type text NOT NULL DEFAULT 'manual',
  ADD COLUMN source_bucket text,
  ADD COLUMN source_path text,
  ADD COLUMN synced_at timestamptz;

ALTER TABLE guide_flow_knowledge
  ADD CONSTRAINT uq_knowledge_source UNIQUE (source_bucket, source_path);
```

**Edge Function `sync` (lógica central):**
- Usa `supabase.storage.from(bucket).list()` com service role (sem RLS)
- Para PDFs, armazena referência (não extrai conteúdo inline — o `guide-flow-generate` já faz download server-side)
- Categoria automática: `guide-structure` → `estrutura`, `guide-library` → `referencia`
- Título: nome do arquivo sem extensão

**Interface — indicadores visuais:**
- Badge `📦 guide-structure` ou `📦 guide-library` para entradas importadas
- Badge `✍️ Manual` para entradas criadas à mão
- Tooltip com path completo e data de sincronização
- Novo filtro dropdown: "Todas" / "Storage" / "Manual"

**Arquivos a criar/editar:**
- Migração SQL (nova)
- `supabase/functions/guide-flow-knowledge/index.ts` (adicionar ação `sync`)
- `src/hooks/useGuideFlowKnowledge.tsx` (adicionar `syncStorage`, tipar novas colunas)
- `src/pages/admin/GuideFlowKnowledge.tsx` (botão sync, badges, filtro)

