-- Add topic column to news table
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS topic text;

-- Update news_generator_config with new parameters
ALTER TABLE public.news_generator_config 
  ADD COLUMN IF NOT EXISTS min_category_distance integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS topic_similarity_threshold numeric NOT NULL DEFAULT 0.90,
  ADD COLUMN IF NOT EXISTS topic_repost_days integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS duplicate_similarity_threshold numeric NOT NULL DEFAULT 0.88,
  ADD COLUMN IF NOT EXISTS max_candidates integer NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS target_news_count integer NOT NULL DEFAULT 3;

-- Add new columns to news_generation_logs for detailed tracking
ALTER TABLE public.news_generation_logs
  ADD COLUMN IF NOT EXISTS discarded_duplicate_semantic integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discarded_duplicate_topic integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS execution_details jsonb;