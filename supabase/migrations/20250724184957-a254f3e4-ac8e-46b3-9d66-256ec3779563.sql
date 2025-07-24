-- Criar função para promover usuário a admin (apenas admins podem executar)
CREATE OR REPLACE FUNCTION public.promover_usuario_admin(
  usuario_id UUID,
  novo_tipo TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF (SELECT tipo_usuario FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar roles de usuários';
  END IF;
  
  -- Verificar se o novo tipo é válido
  IF novo_tipo NOT IN ('admin', 'promotor') THEN
    RAISE EXCEPTION 'Tipo de usuário inválido. Use "admin" ou "promotor"';
  END IF;
  
  -- Verificar se o usuário existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = usuario_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Atualizar o tipo do usuário
  UPDATE public.profiles 
  SET tipo_usuario = novo_tipo,
      updated_at = now()
  WHERE id = usuario_id;
  
  RETURN TRUE;
END;
$$;