
-- RPC pública: retorna apenas o total de usuários cadastrados (sem expor dados sensíveis)
CREATE OR REPLACE FUNCTION public.public_users_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) FROM auth.users;
$$;

-- Conceder EXECUTE para anon e authenticated
GRANT EXECUTE ON FUNCTION public.public_users_count() TO anon;
GRANT EXECUTE ON FUNCTION public.public_users_count() TO authenticated;
