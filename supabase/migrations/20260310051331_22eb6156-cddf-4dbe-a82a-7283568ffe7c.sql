-- Update header_title with **highlight** markers for 6 pages
UPDATE page_settings SET header_title = 'Aprenda, Organize e **Evolua** com as Ferramentas Certas', updated_at = now() WHERE route = '/';
UPDATE page_settings SET header_title = 'Ferramentas e Plataformas Educacionais **Gratuitas**', updated_at = now() WHERE route = '/ferramentas';
UPDATE page_settings SET header_title = 'Concursos Públicos **Abertos** e Previstos', updated_at = now() WHERE route = '/concursos';
UPDATE page_settings SET header_title = 'Guias e **Soluções** Criadas pelo PqEstudar', updated_at = now() WHERE route = '/produtos';
UPDATE page_settings SET header_title = 'Vote nas **Próximas** Funcionalidades', updated_at = now() WHERE route = '/votacoes';
UPDATE page_settings SET header_title = 'Área **Premium** do PqEstudar', updated_at = now() WHERE route = '/premium';