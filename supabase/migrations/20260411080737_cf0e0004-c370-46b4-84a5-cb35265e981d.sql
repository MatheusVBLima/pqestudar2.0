
-- Table for storing editorial rules and knowledge base entries for guide generation
CREATE TABLE public.guide_flow_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS: deny by default, admin-only via edge function
ALTER TABLE public.guide_flow_knowledge ENABLE ROW LEVEL SECURITY;

-- Admin read policy (for edge function context fetching via service role, no public access)
CREATE POLICY "Admin can read knowledge" ON public.guide_flow_knowledge
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Updated at trigger
CREATE TRIGGER update_guide_flow_knowledge_updated_at
  BEFORE UPDATE ON public.guide_flow_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
