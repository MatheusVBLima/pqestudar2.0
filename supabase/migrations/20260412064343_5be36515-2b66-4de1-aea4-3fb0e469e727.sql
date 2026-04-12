
ALTER TABLE public.guides
ADD COLUMN flow_data jsonb DEFAULT NULL;

COMMENT ON COLUMN public.guides.flow_data IS 'Persisted GeneratedGuideData + inputs from the Guide Flow editor for re-opening';
