-- Revogar privilégios diretos em user_roles para forçar uso de RLS

-- Revogar todos os privilégios de anon e authenticated
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.user_roles FROM authenticated;

-- Conceder apenas o necessário para RLS funcionar
-- authenticated precisa de SELECT básico para RLS avaliar políticas
GRANT SELECT ON public.user_roles TO authenticated;

-- INSERT/UPDATE/DELETE também precisam ser permitidos no nível de GRANT
-- para que as políticas RLS possam então controlar o acesso
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Garantir que anon NÃO tenha nenhum privilégio
-- (já foi feito com REVOKE ALL, mas explicitar para clareza)