# Segurança do Projeto PqEstudar

## Autenticação e Autorização

### Sistema de Roles

A tabela `public.user_roles` armazena os papéis dos usuários (admin, moderator, user) e está protegida por Row Level Security (RLS).

#### Proteções Implementadas

1. **RLS Ativada**: A tabela possui RLS habilitada para controlar acesso aos dados.

2. **Políticas de Acesso**:
   - **Anon (não autenticados)**: Negado explicitamente todo acesso (SELECT, INSERT, UPDATE, DELETE)
   - **Authenticated (usuários comuns)**: Podem ver apenas suas próprias roles (WHERE user_id = auth.uid())
   - **Admins**: Têm acesso completo via função `is_admin()`

3. **Função `is_admin()`**:
   - Tipo: SECURITY DEFINER (executa com privilégios do owner)
   - Retorna: boolean
   - Comportamento: Verifica se auth.uid() possui role 'admin' em user_roles
   - Segurança: search_path controlado para prevenir SQL injection

#### Acesso Seguro no App

**❌ NUNCA faça**:
```typescript
// Isso expõe todos os admins!
const { data } = await supabase
  .from('user_roles')
  .select('*')
  .eq('role', 'admin');
```

**✅ SEMPRE use a RPC**:
```typescript
// Verifica se o usuário atual é admin sem expor dados
const { data: isAdmin } = await supabase.rpc('is_admin');

if (isAdmin) {
  // Mostrar painel admin
}
```

#### Controle de Acesso Admin

- O hook `useUserRoles` usa `is_admin()` para verificar privilégios
- Páginas admin (ex: `/admin-courses`) verificam autenticação E admin status
- Componentes sensíveis só renderizam se `isAdmin === true`
- Nunca expor lista completa de admins no frontend

## Proteção de Dados Sensíveis

### Newsletter Subscribers
- Emails protegidos por RLS
- Acesso apenas via edge functions autenticadas
- Sem SELECT público

### Courses - VIEW Pública Segura

A tabela `courses` contém informações sensíveis como `created_by` e `updated_by` que identificam quem criou ou modificou cada curso.

#### Proteção Implementada

1. **VIEW `public.active_courses`**:
   - **SECURITY INVOKER**: View criada com `security_invoker = true` para herdar RLS da tabela base
   - Expõe apenas campos seguros (sem `created_by` nem `updated_by`)
   - Filtra automaticamente: `WHERE is_active = true AND is_hidden = false`
   - Inclui campos calculados pré-processados:
     - `likes`: COALESCE(upvotes, 0)
     - `dislikes`: COALESCE(downvotes, 0)
     - `rating`: Nota de 0 a 5 baseada em (likes - dislikes) / total_votos
   - Acesso READ-ONLY para `anon` e `authenticated`
   - GRANT SELECT explícito para anon e authenticated
   - Herda políticas RLS da tabela `courses` (não usa SECURITY DEFINER)

2. **Tabela `courses` original**:
   - Mantém RLS restritivo
   - Admins têm acesso total via `is_admin()`
   - Público não tem acesso direto à tabela
   - Operações de INSERT/UPDATE/DELETE restritas a admins

#### Acesso Seguro no App

**❌ NUNCA faça**:
```typescript
// Isso expõe created_by e updated_by!
const { data } = await supabase
  .from('courses')
  .select('*');
```

**✅ SEMPRE use a VIEW**:
```typescript
// Acesso seguro via VIEW sem dados sensíveis
const { data } = await supabase
  .from('active_courses')
  .select('*');

// A VIEW já retorna likes, dislikes e rating calculado
// Não é necessário calcular no frontend
```

## Boas Práticas

1. **Validação Client-Side + Server-Side**: Nunca confiar apenas no frontend
2. **RLS em Todas as Tabelas**: Todas as tabelas com dados sensíveis devem ter RLS
3. **SECURITY DEFINER com Cuidado**: Sempre definir search_path nas funções
4. **Logs Mínimos**: Não logar dados sensíveis (senhas, tokens, emails)
5. **Índices**: user_roles tem índice em user_id para performance

## Testes de Segurança

Execute periodicamente:

1. Teste de acesso anônimo às tabelas protegidas
2. Verificação de que usuários comuns não veem dados de outros
3. Confirmação de que apenas admins acessam áreas restritas
4. Auditoria de políticas RLS via Supabase Dashboard

## Rotação da Chave Brevo (BREVO_API_KEY)

A chave da Brevo é usada **exclusivamente** pela Edge Function `subscribe-newsletter-brevo` e fica armazenada como Supabase Secret. Em caso de suspeita de vazamento, siga este procedimento:

### Procedimento de Rotação

1. **Brevo → SMTP & API → API Keys**: revogue (Delete) a chave comprometida.
2. Gere nova chave com nome rastreável (ex.: `pqestudar-supabase-edge-AAAA-MM`).
3. Se o plano permitir, restrinja por IP de saída.
4. Atualize o secret `BREVO_API_KEY` em **Supabase Dashboard → Edge Functions → Secrets**.
5. Sem necessidade de redeploy — a função lê o secret a cada execução.

### Checklist de Incidente

- [ ] Chave antiga revogada no Brevo
- [ ] Nova chave gerada com nome identificável
- [ ] Secret atualizado no Supabase
- [ ] Auditado: GitHub history, Zapier, Make, Vercel, Railway, scripts locais, Postman
- [ ] Brevo → Security → Activity revisado por chamadas suspeitas
- [ ] 2FA confirmado na conta Brevo
- [ ] Extensões de navegador com permissão `*://*.brevo.com/*` revisadas

### Hardening Implementado na Edge Function

- **CORS allowlist** (apenas pqestudar.com.br + previews Lovable)
- **Validação server-side de e-mail** (regex + tamanho ≤ 255)
- **Rate limit reforçado**: 5 tentativas / 15 min + cap diário de 20 por IP
- **Honeypot** (`website`) descarta bots silenciosamente
- **Logs sanitizados**: só `status` + `code` da Brevo, nunca o corpo cru
- **User-Agent identificável** (`pqestudar-edge/1.0`) para rastreabilidade
- **`verify_jwt = false` explícito** em `config.toml`

### Detecção de Abuso

Consulta SQL para inspecionar picos de erro por IP nas últimas 24h:

```sql
SELECT ip_hash,
       COUNT(*) AS errors,
       MAX(created_at) AS last_error
FROM public.newsletter_events
WHERE event_type = 'newsletter_error'
  AND created_at > now() - interval '24 hours'
GROUP BY ip_hash
HAVING COUNT(*) > 10
ORDER BY errors DESC;
```

## Recursos

- [Documentação Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Segurança Lovable](https://docs.lovable.dev/features/security)
