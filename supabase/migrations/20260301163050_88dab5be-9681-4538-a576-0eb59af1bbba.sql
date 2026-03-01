
-- Add icon breakpoint visibility columns to nav_items
ALTER TABLE public.nav_items
  ADD COLUMN IF NOT EXISTS show_icon_desktop boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_icon_tablet boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_icon_mobile boolean NOT NULL DEFAULT false;

-- Recreate nav_items_public view to include new columns
DROP VIEW IF EXISTS public.nav_items_public;
CREATE VIEW public.nav_items_public WITH (security_invoker = true) AS
  SELECT
    id,
    label,
    href,
    icon,
    order_index,
    is_active,
    is_external,
    open_in_new_tab,
    show_icon_desktop,
    show_icon_tablet,
    show_icon_mobile
  FROM public.nav_items
  WHERE is_active = true
  ORDER BY order_index;

-- Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.nav_items_public TO anon, authenticated;
