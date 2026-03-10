

## Plano: Conectar contagem real de usuários + fallback 38 para newsletter

### Respostas às suas dúvidas

**Ferramentas e Concursos** — Sim, são conexões reais ao Supabase. Sempre que você adicionar/remover uma ferramenta ou concurso, o número atualiza automaticamente (com cache de 10 min).

**Usuários** — O Supabase tem 29 usuários cadastrados em `auth.users`, mas essa tabela não é acessível pelo frontend (anon/authenticated). Precisamos criar uma função RPC segura que retorne apenas o count.

**Newsletter** — Entendido: o número 38 será usado como fallback estático, com comentário claro no código.

### Alterações

**1. Criar RPC no Supabase: `public_users_count()`**

```sql
CREATE OR REPLACE FUNCTION public.public_users_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) FROM auth.users;
$$;
```

- `SECURITY DEFINER` permite acessar `auth.users` mesmo com role `anon`.
- Retorna apenas o número total, sem expor dados sensíveis.
- Conceder `EXECUTE` para `anon` e `authenticated`.

**2. Atualizar `useSocialProofMetrics.ts`**

- Adicionar query para `supabase.rpc('public_users_count')` com `staleTime: 10min`.
- Trocar `newsletterCount = null` por `newsletterCount = 38` com comentário `// Fallback estático — fonte real: Brevo (não acessível via Supabase)`.
- Ambas as mudanças são simples, no mesmo arquivo.

### Resultado

- Card "Usuários" mostra o número real (hoje 29), atualizado dinamicamente.
- Card "Newsletter" mostra 38 (estático até haver integração com Brevo).
- Ferramentas e Concursos continuam dinâmicos como já estão.

