ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS author_name text NOT NULL DEFAULT 'Equipe PqEstudar';