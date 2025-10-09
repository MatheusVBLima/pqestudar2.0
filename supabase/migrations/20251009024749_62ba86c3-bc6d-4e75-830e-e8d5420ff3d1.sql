-- Remove a política SELECT pública que expõe endereços IP
DROP POLICY IF EXISTS "Allow reading recent submissions for rate limiting" ON public.anonymous_course_suggestions_rate_limit;

-- Criar política para permitir apenas inserção (não leitura) por qualquer um
-- A verificação de rate limit será feita server-side na Edge Function
CREATE POLICY "Allow anonymous rate limit tracking" 
ON public.anonymous_course_suggestions_rate_limit
FOR INSERT
WITH CHECK (true);

-- Comentário de segurança
COMMENT ON TABLE public.anonymous_course_suggestions_rate_limit IS 'Tabela para rate limiting de sugestões anônimas. IPs NÃO devem ser expostos ao cliente. Use Edge Function para verificação.';