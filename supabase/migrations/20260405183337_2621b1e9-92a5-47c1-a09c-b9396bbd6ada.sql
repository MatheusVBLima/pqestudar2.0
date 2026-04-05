
-- 1. Add internal_code column
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS internal_code text;

-- 2. Backfill existing guides with unique codes
DO $$
DECLARE
  r RECORD;
  new_code text;
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
  attempt int;
BEGIN
  FOR r IN SELECT id FROM public.guides WHERE internal_code IS NULL LOOP
    attempt := 0;
    LOOP
      new_code := 'G-';
      FOR i IN 1..6 LOOP
        new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
      END LOOP;
      BEGIN
        UPDATE public.guides SET internal_code = new_code WHERE id = r.id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        attempt := attempt + 1;
        IF attempt > 20 THEN RAISE EXCEPTION 'Too many collisions'; END IF;
      END;
    END LOOP;
  END LOOP;
END $$;

-- 3. Now make it NOT NULL + UNIQUE
ALTER TABLE public.guides ALTER COLUMN internal_code SET NOT NULL;
ALTER TABLE public.guides ADD CONSTRAINT guides_internal_code_unique UNIQUE (internal_code);

-- 4. Trigger: auto-generate on INSERT if null
CREATE OR REPLACE FUNCTION public.generate_guide_internal_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  new_code text;
  i int;
  attempt int := 0;
BEGIN
  IF NEW.internal_code IS NOT NULL AND NEW.internal_code <> '' THEN
    RETURN NEW;
  END IF;
  LOOP
    new_code := 'G-';
    FOR i IN 1..6 LOOP
      new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM public.guides WHERE internal_code = new_code) THEN
      NEW.internal_code := new_code;
      RETURN NEW;
    END IF;
    attempt := attempt + 1;
    IF attempt > 50 THEN
      RAISE EXCEPTION 'Unable to generate unique internal_code after 50 attempts';
    END IF;
  END LOOP;
END;
$$;

CREATE TRIGGER trg_guides_generate_internal_code
  BEFORE INSERT ON public.guides
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_guide_internal_code();

-- 5. Trigger: block updates to internal_code
CREATE OR REPLACE FUNCTION public.protect_guide_internal_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF OLD.internal_code IS NOT NULL AND NEW.internal_code IS DISTINCT FROM OLD.internal_code THEN
    NEW.internal_code := OLD.internal_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_guides_protect_internal_code
  BEFORE UPDATE ON public.guides
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_guide_internal_code();
