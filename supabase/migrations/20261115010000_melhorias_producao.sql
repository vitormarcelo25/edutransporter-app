-- =====================================================================
-- EduTransporte - Melhorias de Produção
-- 1. RPC segura para alteração de senha (aluno e motorista)
-- 2. Tabela push_token para registro de tokens de notificação por CPF
-- 3. Defaults de mensagem (created_at / deletado) e permissões extras
-- Script idempotente: pode ser executado mais de uma vez no SQL Editor.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 1. RPC segura de alteração de senha
-- Verifica a senha atual via bcrypt e atualiza com novo hash bcrypt.
-- ---------------------------------------------------------------------
create or replace function public.alterar_senha_usuario(
  p_cpf text,
  p_senha_atual text,
  p_nova_senha text,
  p_tipo text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cpf  text := regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g');
  v_tipo text := lower(coalesce(p_tipo, 'aluno'));
  v_hash text;
begin
  if length(v_cpf) <> 11 or coalesce(p_senha_atual, '') = '' or length(coalesce(p_nova_senha, '')) < 6 then
    return jsonb_build_object('resultado', 'dados_invalidos');
  end if;

  if v_tipo = 'motorista' then
    select senha into v_hash from public.motorista where cpf = v_cpf limit 1;
    if v_hash is null then
      return jsonb_build_object('resultado', 'usuario_nao_encontrado');
    end if;
    if not (v_hash ~ '^\$2[aby]\$\d{2}\$' and extensions.crypt(p_senha_atual, v_hash) = v_hash) then
      return jsonb_build_object('resultado', 'senha_atual_incorreta');
    end if;
    update public.motorista
       set senha = extensions.crypt(p_nova_senha, extensions.gen_salt('bf', 10))
     where cpf = v_cpf;
    return jsonb_build_object('resultado', 'ok');
  end if;

  select senha into v_hash from public.aluno where cpf = v_cpf limit 1;
  if v_hash is null then
    return jsonb_build_object('resultado', 'usuario_nao_encontrado');
  end if;
  if not (v_hash ~ '^\$2[aby]\$\d{2}\$' and extensions.crypt(p_senha_atual, v_hash) = v_hash) then
    return jsonb_build_object('resultado', 'senha_atual_incorreta');
  end if;
  update public.aluno
     set senha = extensions.crypt(p_nova_senha, extensions.gen_salt('bf', 10))
   where cpf = v_cpf;
  return jsonb_build_object('resultado', 'ok');
end;
$$;

revoke all on function public.alterar_senha_usuario(text, text, text, text) from public;
grant execute on function public.alterar_senha_usuario(text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Tokens de Push Notification por usuário
-- ---------------------------------------------------------------------
create table if not exists public.push_token (
  cpf           text primary key,
  token         text not null,
  tipo          text not null default 'aluno',
  atualizado_em timestamptz not null default now()
);

alter table public.push_token enable row level security;
drop policy if exists app_acesso_push_token on public.push_token;
create policy app_acesso_push_token on public.push_token
  for all to anon, authenticated using (true) with check (true);
grant select, insert, update, delete on public.push_token to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Defaults de chat e permissões de convites / mensagens
-- ---------------------------------------------------------------------
alter table public.mensagem alter column created_at set default now();
alter table public.mensagem alter column deletado set default false;

grant select, insert, update, delete on public.convite to anon, authenticated;
grant select, insert, update, delete on public.mensagem to anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['convite', 'mensagem'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists app_acesso on public.%I', t);
    execute format('create policy app_acesso on public.%I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end;
$$;

notify pgrst, 'reload schema';
