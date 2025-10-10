-- 1. Limpar todos os cursos existentes
DELETE FROM public.courses;

-- 2. Renomear coluna instructor para institution
ALTER TABLE public.courses RENAME COLUMN instructor TO institution;

-- 3. Criar tipo enum para badges de tendência
CREATE TYPE public.course_badge AS ENUM ('trending', 'popular', 'community');

-- 4. Adicionar coluna badge na tabela courses
ALTER TABLE public.courses ADD COLUMN badge course_badge;

-- 5. Criar tabela de votos
CREATE TABLE public.course_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- 6. Adicionar colunas de contadores na tabela courses
ALTER TABLE public.courses ADD COLUMN upvotes INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN downvotes INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN vote_score INTEGER DEFAULT 0;

-- 7. Habilitar RLS na tabela course_votes
ALTER TABLE public.course_votes ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para course_votes
CREATE POLICY "Todos podem ver votos"
ON public.course_votes
FOR SELECT
USING (true);

CREATE POLICY "Usuários autenticados podem votar"
ON public.course_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios votos"
ON public.course_votes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios votos"
ON public.course_votes
FOR DELETE
USING (auth.uid() = user_id);

-- 9. Criar trigger para atualizar updated_at em course_votes
CREATE TRIGGER update_course_votes_updated_at
BEFORE UPDATE ON public.course_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Criar função para atualizar contadores de votos
CREATE OR REPLACE FUNCTION public.update_course_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE public.courses SET upvotes = upvotes + 1, vote_score = vote_score + 1 WHERE id = NEW.course_id;
    ELSE
      UPDATE public.courses SET downvotes = downvotes + 1, vote_score = vote_score - 1 WHERE id = NEW.course_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE public.courses SET upvotes = upvotes - 1, downvotes = downvotes + 1, vote_score = vote_score - 2 WHERE id = NEW.course_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE public.courses SET upvotes = upvotes + 1, downvotes = downvotes - 1, vote_score = vote_score + 2 WHERE id = NEW.course_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE public.courses SET upvotes = upvotes - 1, vote_score = vote_score - 1 WHERE id = OLD.course_id;
    ELSE
      UPDATE public.courses SET downvotes = downvotes - 1, vote_score = vote_score + 1 WHERE id = OLD.course_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 11. Criar trigger para atualizar contadores automaticamente
CREATE TRIGGER course_votes_update_counts
AFTER INSERT OR UPDATE OR DELETE ON public.course_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_course_vote_counts();