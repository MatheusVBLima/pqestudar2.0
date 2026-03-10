INSERT INTO public.page_settings (route, title_tag, meta_description, header_title, header_description)
VALUES (
  '/sobre-pqestudar',
  'Sobre o PqEstudar: ferramentas, concursos e conteúdo prático | PqEstudar',
  'Entenda como o PqEstudar organiza ferramentas, concursos e conteúdos práticos para você estudar melhor, economizar tempo e decidir com mais clareza.',
  'O PqEstudar existe para facilitar o que deveria ser **simples**',
  'Reunimos ferramentas, oportunidades e conteúdos práticos para ajudar você a estudar melhor e decidir com mais clareza.'
)
ON CONFLICT (route) DO NOTHING;