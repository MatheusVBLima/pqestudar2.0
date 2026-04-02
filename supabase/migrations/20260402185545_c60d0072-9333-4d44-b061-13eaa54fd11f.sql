-- Seed page_settings for /guias
INSERT INTO public.page_settings (route, title_tag, meta_description, header_title, header_description)
VALUES (
  '/guias',
  'Guias práticos para estudar melhor | PqEstudar',
  'Guias evergreen com passos práticos, listas e recomendações para estudar com mais clareza e aproveitar oportunidades.',
  'Guias',
  'Conteúdos práticos e evergreen para estudar com mais clareza e aproveitar oportunidades.'
)
ON CONFLICT (route) DO NOTHING;

-- Seed nav_items for Guias menu item
INSERT INTO public.nav_items (label, href, icon, is_active, is_external, open_in_new_tab, order_index, show_icon_desktop, show_icon_tablet, show_icon_mobile)
SELECT
  'Guias',
  '/guias',
  'BookOpen',
  true,
  false,
  false,
  COALESCE((SELECT MAX(order_index) FROM public.nav_items), 0) + 1,
  true,
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.nav_items WHERE href = '/guias'
);