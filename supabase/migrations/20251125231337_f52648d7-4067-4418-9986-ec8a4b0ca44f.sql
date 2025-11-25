-- Criar bucket para anexos de ferramentas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tools-attachments',
  'tools-attachments',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/plain', 'application/epub+zip']
);

-- Policy: Qualquer pessoa pode ler anexos (bucket público)
CREATE POLICY "Anexos são publicamente acessíveis"
ON storage.objects FOR SELECT
USING (bucket_id = 'tools-attachments');

-- Policy: Apenas admins podem fazer upload de anexos
CREATE POLICY "Admins podem fazer upload de anexos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tools-attachments' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

-- Policy: Apenas admins podem atualizar anexos
CREATE POLICY "Admins podem atualizar anexos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tools-attachments'
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

-- Policy: Apenas admins podem deletar anexos
CREATE POLICY "Admins podem deletar anexos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tools-attachments'
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);