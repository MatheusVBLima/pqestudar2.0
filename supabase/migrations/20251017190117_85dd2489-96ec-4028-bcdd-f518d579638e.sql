-- Adicionar colunas necessárias à tabela courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS affiliate_link text,
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false NOT NULL;

-- Criar índice para otimizar consultas de cursos visíveis
CREATE INDEX IF NOT EXISTS idx_courses_is_hidden ON public.courses(is_hidden);

-- Remover policies antigas restritivas
DROP POLICY IF EXISTS "Apenas admins podem atualizar cursos" ON public.courses;
DROP POLICY IF EXISTS "Apenas admins podem criar cursos" ON public.courses;
DROP POLICY IF EXISTS "Apenas admins podem deletar cursos" ON public.courses;
DROP POLICY IF EXISTS "Todos podem ver cursos ativos" ON public.courses;

-- Criar novas policies mais flexíveis
CREATE POLICY "Todos podem ver cursos ativos e não ocultos"
ON public.courses
FOR SELECT
USING (is_active = true AND is_hidden = false);

CREATE POLICY "Admins podem ver todos os cursos"
ON public.courses
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins podem criar cursos"
ON public.courses
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem atualizar cursos"
ON public.courses
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins podem deletar cursos"
ON public.courses
FOR DELETE
USING (public.is_admin());