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

### Courses
- `created_by` e `updated_by` visíveis apenas para admins
- Dados públicos limitados aos necessários para exibição

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

## Recursos

- [Documentação Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Segurança Lovable](https://docs.lovable.dev/features/security)
