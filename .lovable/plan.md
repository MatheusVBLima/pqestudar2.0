
## Objetivo
Fazer o upload de imagens em `/votacoes` funcionar de forma idêntica ao `/ferramentas`, corrigindo as RLS policies do bucket `vote-images` e alinhando o código de upload.

## Causa raiz identificada (diagnóstico cirúrgico)

### Diferença 1: Policies do Storage (problema principal)

| Campo | `tools-icons` (FUNCIONA) | `vote-images` (FALHA) |
|---|---|---|
| `INSERT roles` | `TO authenticated` | `TO public` |
| `INSERT with_check` | `(SELECT is_admin())` | subquery manual `user_roles` |
| `UPDATE roles` | `TO authenticated` | `TO public` |
| `DELETE roles` | `TO authenticated` | `TO public` |

**Causa:** quando a policy usa `TO public`, o Supabase Storage NÃO garante que o contexto JWT (usuário autenticado) seja carregado na avaliação da policy. Resultado: `auth.uid()` retorna `null` dentro da policy, e a subquery `auth.uid() IN (SELECT user_id FROM user_roles...)` falha — bloqueando o upload com 400.

`TO authenticated` força o Supabase a avaliar a policy COM o JWT do usuário, garantindo que `auth.uid()` retorne o UUID correto.

### Diferença 2: Código de upload

`/ferramentas` usa `upsert: false`. `/votacoes` usa `upsert: true`, que internamente exige que a policy de `UPDATE` também seja validada. Se UPDATE falha (por causa do `TO public`), o upsert inteiro falha.

## Plano de implementação

### Passo 1: Migration SQL — corrigir policies do `vote-images`

Dropar todas as policies atuais do `vote-images` e recriar idênticas ao padrão do `tools-icons`:

```sql
-- Drop todas as policies atuais de vote-images
DROP POLICY IF EXISTS "Admins can upload vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update vote images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete vote images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view vote images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read vote images" ON storage.objects;

-- INSERT: idêntico ao tools-icons (TO authenticated + SELECT is_admin())
CREATE POLICY "Admins can upload vote images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );

-- UPDATE: idêntico ao tools-icons
CREATE POLICY "Admins can update vote images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );

-- DELETE: idêntico ao tools-icons
CREATE POLICY "Admins can delete vote images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vote-images'
    AND (SELECT public.is_admin())
  );

-- SELECT: público (bucket é público)
CREATE POLICY "Public can view vote images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'vote-images');
```

### Passo 2: Ajuste no código de upload (`src/pages/Votacoes.tsx`)

Alinhar o `handleSave` com o padrão exato do `ToolModal.tsx`:
- Mudar `upsert: true` para `upsert: false` (igual ao `tools-icons`)
- Remover o `contentType` explícito (igual ao `tools-icons`)

```typescript
// ANTES (votacoes - diferente)
await supabase.storage
  .from('vote-images')
  .upload(fileName, formPendingFile, {
    cacheControl: '3600',
    upsert: true,
    contentType: formPendingFile.type,  // <- remover
  });

// DEPOIS (idêntico ao tools-icons)
await supabase.storage
  .from('vote-images')
  .upload(fileName, formPendingFile, {
    cacheControl: '3600',
    upsert: false,
  });
```

## Arquivos modificados
- Nova migration SQL (apenas políticas de storage)
- `src/pages/Votacoes.tsx` (3 linhas alteradas no `handleSave`)

## O que NÃO muda
- Rotas, menu, layout global
- Lógica de votação, badges, CTA "Votar"
- Cards, border-radius, ordenação
- Qualquer outra página
