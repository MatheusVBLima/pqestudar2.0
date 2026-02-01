-- Tabela para ferramentas salvas por usuário
CREATE TABLE public.saved_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, tool_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_tools ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seus próprios salvos
CREATE POLICY "Users can view own saved tools" 
ON public.saved_tools 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir seus próprios salvos
CREATE POLICY "Users can insert own saved tools" 
ON public.saved_tools 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar seus próprios salvos
CREATE POLICY "Users can delete own saved tools" 
ON public.saved_tools 
FOR DELETE 
USING (auth.uid() = user_id);

-- Index para performance
CREATE INDEX idx_saved_tools_user_id ON public.saved_tools(user_id);
CREATE INDEX idx_saved_tools_tool_id ON public.saved_tools(tool_id);