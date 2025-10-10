-- Corrigir vulnerabilidade de segurança na tabela course_votes
-- Remover política que expõe dados de usuários publicamente

-- 1. Remover a política insegura que permite acesso público
DROP POLICY IF EXISTS "Todos podem ver votos" ON public.course_votes;

-- 2. Criar política segura: usuários só podem ver seus próprios votos
CREATE POLICY "Usuários podem ver apenas seus próprios votos"
ON public.course_votes
FOR SELECT
USING (auth.uid() = user_id);

-- Nota: As contagens agregadas (upvotes/downvotes) já estão disponíveis
-- publicamente na tabela courses, então não há necessidade de expor
-- os votos individuais para todos os usuários.