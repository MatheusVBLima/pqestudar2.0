-- Create saved_items table for multi-type saved items (tools, contests)
CREATE TABLE public.saved_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('tool', 'contest')),
  item_id UUID NOT NULL,
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicates
CREATE UNIQUE INDEX saved_items_unique_idx ON public.saved_items (user_id, item_type, item_id);

-- Create index for faster lookups by user and type
CREATE INDEX saved_items_user_type_idx ON public.saved_items (user_id, item_type);

-- Enable Row Level Security
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Users can only view their own saved items
CREATE POLICY "Users can view own saved items"
  ON public.saved_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own saved items
CREATE POLICY "Users can insert own saved items"
  ON public.saved_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own saved items
CREATE POLICY "Users can delete own saved items"
  ON public.saved_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Migrate existing data from saved_tools to saved_items
INSERT INTO public.saved_items (user_id, item_type, item_id, created_at)
SELECT user_id, 'tool', tool_id, created_at
FROM public.saved_tools
ON CONFLICT DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE public.saved_items IS 'Stores user saved items (tools, contests) with optional metadata for quick rendering';