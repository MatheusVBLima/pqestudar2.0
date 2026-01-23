
-- Drop existing CHECK constraint
ALTER TABLE public.oportunidades 
DROP CONSTRAINT oportunidades_tipo_check;

-- Recreate with new value included
ALTER TABLE public.oportunidades 
ADD CONSTRAINT oportunidades_tipo_check 
CHECK (tipo = ANY (ARRAY[
  'Concurso'::text, 
  'Programa educacional'::text, 
  'Processo seletivo'::text,
  'Processo Seletivo Simplificado'::text
]));
