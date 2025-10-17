-- Adicionar colunas necessárias à tabela courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS affiliate_link text,
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false NOT NULL;

-- Criar índice para otimizar consultas de cursos visíveis
CREATE INDEX IF NOT EXISTS idx_courses_is_hidden ON public.courses(is_hidden);

-- Remover TODAS as policies existentes
DROP POLICY IF EXISTS "Apenas admins podem atualizar cursos" ON public.courses;
DROP POLICY IF EXISTS "Apenas admins podem criar cursos" ON public.courses;
DROP POLICY IF EXISTS "Apenas admins podem deletar cursos" ON public.courses;
DROP POLICY IF EXISTS "Todos podem ver cursos ativos" ON public.courses;
DROP POLICY IF EXISTS "Todos podem ver cursos ativos e não ocultos" ON public.courses;
DROP POLICY IF EXISTS "Admins podem ver todos os cursos" ON public.courses;
DROP POLICY IF EXISTS "Admins podem criar cursos" ON public.courses;
DROP POLICY IF EXISTS "Admins podem atualizar cursos" ON public.courses;
DROP POLICY IF EXISTS "Admins podem deletar cursos" ON public.courses;

-- Criar policies corretas
CREATE POLICY "public_can_view_active_courses"
ON public.courses
FOR SELECT
USING (is_active = true AND is_hidden = false);

CREATE POLICY "admins_can_view_all_courses"
ON public.courses
FOR SELECT
USING (public.is_admin());

CREATE POLICY "admins_can_insert_courses"
ON public.courses
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "admins_can_update_courses"
ON public.courses
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "admins_can_delete_courses"
ON public.courses
FOR DELETE
USING (public.is_admin());