-- Fix infinite recursion in RLS policies by creating a security definer function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT tipo_usuario FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Create new safe policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'admin');

-- Add constraints for input validation on financial tables
ALTER TABLE public.adiantamentos 
ADD CONSTRAINT check_valor_positivo CHECK (valor > 0),
ADD CONSTRAINT check_valor_maximo CHECK (valor <= 50000);

ALTER TABLE public.reembolsos_km 
ADD CONSTRAINT check_km_positivo CHECK (km_rodados > 0),
ADD CONSTRAINT check_km_maximo CHECK (km_rodados <= 2000),
ADD CONSTRAINT check_valor_km_positivo CHECK (valor_por_km > 0),
ADD CONSTRAINT check_valor_km_maximo CHECK (valor_por_km <= 10);

ALTER TABLE public.vale_refeicao 
ADD CONSTRAINT check_valor_positivo CHECK (valor > 0),
ADD CONSTRAINT check_valor_maximo CHECK (valor <= 1000);