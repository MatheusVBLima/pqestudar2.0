-- Adicionar coluna opcional attachment_url à tabela tools
ALTER TABLE public.tools
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

COMMENT ON COLUMN public.tools.attachment_url IS 'URL opcional para download direto de arquivo (PDF, e-book, etc.)';
