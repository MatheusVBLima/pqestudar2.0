CREATE OR REPLACE FUNCTION public.validate_guide_public_category()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.public_category NOT IN (
    'Educação', 'Carreira', 'Ferramentas', 'Guias',
    'Benefícios', 'Oportunidades', 'Listas', 'Segurança Digital'
  ) THEN
    RAISE EXCEPTION 'Categoria Pública inválida: %. Valores permitidos: Educação, Carreira, Ferramentas, Guias, Benefícios, Oportunidades, Listas, Segurança Digital.', NEW.public_category;
  END IF;
  RETURN NEW;
END;
$function$;