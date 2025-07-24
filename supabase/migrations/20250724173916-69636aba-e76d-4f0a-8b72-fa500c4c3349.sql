-- Criar tabela de profiles que estende auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('admin', 'promotor')),
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar tabela de adiantamentos
CREATE TABLE public.adiantamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  data_solicitacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.adiantamentos ENABLE ROW LEVEL SECURITY;

-- Criar tabela de reembolsos de KM
CREATE TABLE public.reembolsos_km (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  km_rodados DECIMAL(10,2) NOT NULL,
  valor_por_km DECIMAL(4,2) NOT NULL DEFAULT 0.70,
  valor_total DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reembolsos_km ENABLE ROW LEVEL SECURITY;

-- Criar tabela de vale refeição
CREATE TABLE public.vale_refeicao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vale_refeicao ENABLE ROW LEVEL SECURITY;

-- RLS Policies para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

-- RLS Policies para adiantamentos
CREATE POLICY "Promotores can view own adiantamentos" ON public.adiantamentos
  FOR SELECT USING (
    promotor_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Promotores can insert own adiantamentos" ON public.adiantamentos
  FOR INSERT WITH CHECK (promotor_id = auth.uid());

CREATE POLICY "Admins can update adiantamentos" ON public.adiantamentos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

-- RLS Policies para reembolsos_km
CREATE POLICY "Promotores can view own reembolsos_km" ON public.reembolsos_km
  FOR SELECT USING (
    promotor_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Promotores can insert own reembolsos_km" ON public.reembolsos_km
  FOR INSERT WITH CHECK (promotor_id = auth.uid());

CREATE POLICY "Admins can update reembolsos_km" ON public.reembolsos_km
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

-- RLS Policies para vale_refeicao
CREATE POLICY "Promotores can view own vale_refeicao" ON public.vale_refeicao
  FOR SELECT USING (
    promotor_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Promotores can insert own vale_refeicao" ON public.vale_refeicao
  FOR INSERT WITH CHECK (promotor_id = auth.uid());

CREATE POLICY "Admins can update vale_refeicao" ON public.vale_refeicao
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

-- Função para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, tipo_usuario, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome_completo', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'tipo_usuario', 'promotor'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adiantamentos_updated_at
  BEFORE UPDATE ON public.adiantamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reembolsos_km_updated_at
  BEFORE UPDATE ON public.reembolsos_km
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vale_refeicao_updated_at
  BEFORE UPDATE ON public.vale_refeicao
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();