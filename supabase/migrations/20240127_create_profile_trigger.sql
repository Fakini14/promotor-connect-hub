-- Função para criar perfil automaticamente após signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    nome_completo,
    email,
    tipo_usuario,
    ativo
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome_completo',
    new.email,
    coalesce((new.raw_user_meta_data ->> 'tipo_usuario')::text, 'promotor'),
    true
  );
  return new;
end;
$$;

-- Trigger para executar a função quando um novo usuário é criado
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Garantir que a função tenha as permissões corretas
grant execute on function public.handle_new_user() to service_role;