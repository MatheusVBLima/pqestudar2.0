INSERT INTO public.page_settings (route, title_tag, meta_description, header_title, header_description)
VALUES (
  '/produtos',
  'Produtos - PqEstudar',
  'Produtos recomendados e recursos para apoiar sua jornada no PqEstudar.',
  'Produtos',
  'Seleção de produtos e recursos com métricas de interesse da comunidade.'
)
ON CONFLICT (route) DO NOTHING;