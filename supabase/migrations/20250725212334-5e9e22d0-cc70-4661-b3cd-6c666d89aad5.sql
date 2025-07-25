-- Criar tabela atestados
CREATE TABLE public.atestados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotor_id UUID NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  motivo TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_aprovacao TIMESTAMP WITH TIME ZONE NULL
);

-- Adicionar constraint para verificar status válidos
ALTER TABLE public.atestados ADD CONSTRAINT atestados_status_check 
CHECK (status IN ('pendente', 'aprovado', 'recusado'));

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_atestados_updated_at
  BEFORE UPDATE ON public.atestados
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.atestados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Promotores podem inserir próprios atestados"
  ON public.atestados
  FOR INSERT
  WITH CHECK (promotor_id = auth.uid());

CREATE POLICY "Promotores podem ver próprios atestados"
  ON public.atestados
  FOR SELECT
  USING (
    promotor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar atestados"
  ON public.atestados
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.tipo_usuario = 'admin'
    )
  );

-- Criar bucket para storage dos atestados
INSERT INTO storage.buckets (id, name, public) VALUES ('atestados', 'atestados', false);

-- Políticas para o bucket atestados
CREATE POLICY "Promotores podem fazer upload de atestados"
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'atestados' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Usuários podem visualizar próprios atestados"
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'atestados' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.tipo_usuario = 'admin'
      )
    )
  );

CREATE POLICY "Promotores podem atualizar próprios atestados"
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'atestados' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Promotores podem deletar próprios atestados"
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'atestados' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );