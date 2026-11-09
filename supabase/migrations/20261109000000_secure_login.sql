-- =====================================================================
-- Login seguro: senha nunca sai do banco
--
-- 1. Hash bcrypt das senhas em texto puro (motorista) + trigger que
--    garante hash em todo INSERT/UPDATE futuro (aluno e motorista).
-- 2. A chave pública (anon/authenticated) não pode mais ler a coluna
--    `senha` de public.aluno e public.motorista.
-- 3. RPC public.login_usuario(cpf, senha, tipo) verifica a senha no
--    servidor e devolve apenas campos seguros.
--
-- Como aplicar: Supabase Dashboard > SQL Editor > colar e rodar.
-- O script é idempotente (pode rodar mais de uma vez).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 1. Hash das senhas
-- ---------------------------------------------------------------------

-- Gera hash bcrypt ($2a$, compatível com o BCryptPasswordEncoder do
-- Spring) somente se o valor ainda não for um hash bcrypt.
create or replace function public.hash_senha_trigger()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.senha is not null
     and new.senha <> ''
     and new.senha !~ '^\$2[aby]\$\d{2}\$'
  then
    new.senha := extensions.crypt(new.senha, extensions.gen_salt('bf', 10));
  end if;
  return new;
end;
$$;

revoke all on function public.hash_senha_trigger() from public, anon, authenticated;

drop trigger if exists aluno_hash_senha on public.aluno;
create trigger aluno_hash_senha
  before insert or update of senha on public.aluno
  for each row execute function public.hash_senha_trigger();

drop trigger if exists motorista_hash_senha on public.motorista;
create trigger motorista_hash_senha
  before insert or update of senha on public.motorista
  for each row execute function public.hash_senha_trigger();

-- Converte as senhas em texto puro que já existem (o trigger faz o hash).
update public.motorista set senha = senha
 where senha is not null and senha <> '' and senha !~ '^\$2[aby]\$\d{2}\$';
update public.aluno set senha = senha
 where senha is not null and senha <> '' and senha !~ '^\$2[aby]\$\d{2}\$';

-- ---------------------------------------------------------------------
-- 2. Coluna `senha` ilegível para a chave pública
--
-- Troca o SELECT da tabela inteira por SELECT em cada coluna, exceto
-- `senha`. Colunas novas ficam ocultas até receberem GRANT explícito.
-- Atenção: a partir daqui `select=*` nessas tabelas retorna
-- "permission denied" para a chave pública; liste as colunas.
-- ---------------------------------------------------------------------
do $$
declare
  t text;
  cols text;
begin
  foreach t in array array['aluno', 'motorista'] loop
    execute format('revoke select on public.%I from anon, authenticated', t);

    select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
      into cols
      from information_schema.columns
     where table_schema = 'public'
       and table_name = t
       and column_name <> 'senha';

    -- Garante que nenhum GRANT antigo de coluna em `senha` sobreviva.
    execute format('revoke select (senha) on public.%I from anon, authenticated', t);
    execute format('grant select (%s) on public.%I to anon, authenticated', cols, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. RPC de login
--
-- POST /rest/v1/rpc/login_usuario
--   { "p_cpf": "12345678901", "p_senha": "...", "p_tipo": "aluno" | "motorista" }
--
-- Respostas (sempre 200, campo `resultado`):
--   ok               -> credenciais corretas, `usuario` com campos seguros
--   pendente         -> aluno com senha correta, cadastro em análise
--   recusado         -> aluno com senha correta, cadastro recusado (+ motivo_recusa)
--   tipo_incorreto   -> senha correta, mas o CPF é do outro perfil (`tipo_real`)
--   invalido         -> CPF inexistente ou senha errada (não diferencia)
-- ---------------------------------------------------------------------
create or replace function public.login_usuario(p_cpf text, p_senha text, p_tipo text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cpf   text := regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g');
  v_tipo  text := lower(coalesce(p_tipo, 'aluno'));
  v_aluno public.aluno%rowtype;
  v_mot   public.motorista%rowtype;
  v_aluno_ok boolean := false;
  v_mot_ok   boolean := false;
begin
  if length(v_cpf) <> 11 or coalesce(p_senha, '') = '' then
    return jsonb_build_object('resultado', 'invalido');
  end if;

  select * into v_aluno from public.aluno where cpf = v_cpf limit 1;
  select * into v_mot   from public.motorista where cpf = v_cpf limit 1;

  v_aluno_ok := v_aluno.senha is not null
            and v_aluno.senha ~ '^\$2[aby]\$\d{2}\$'
            and extensions.crypt(p_senha, v_aluno.senha) = v_aluno.senha;
  v_mot_ok   := v_mot.senha is not null
            and v_mot.senha ~ '^\$2[aby]\$\d{2}\$'
            and extensions.crypt(p_senha, v_mot.senha) = v_mot.senha;

  -- Tempo de resposta parecido quando o CPF não existe (evita descobrir CPFs pelo tempo).
  if v_aluno.cpf is null and v_mot.cpf is null then
    perform extensions.crypt(p_senha, extensions.gen_salt('bf', 10));
    return jsonb_build_object('resultado', 'invalido');
  end if;

  if v_tipo = 'motorista' then
    if v_mot_ok then
      return jsonb_build_object(
        'resultado', 'ok',
        'usuario', jsonb_build_object(
          'tipo', 'motorista',
          'cpf', v_mot.cpf,
          'nome_completo', v_mot.nome_completo,
          'email', v_mot.email
        )
      );
    elsif v_aluno_ok then
      return jsonb_build_object('resultado', 'tipo_incorreto', 'tipo_real', 'aluno');
    end if;
    return jsonb_build_object('resultado', 'invalido');
  end if;

  -- aluno
  if v_aluno_ok then
    if upper(coalesce(v_aluno.status, '')) = 'PENDENTE' then
      return jsonb_build_object('resultado', 'pendente');
    elsif upper(coalesce(v_aluno.status, '')) = 'RECUSADO' then
      return jsonb_build_object('resultado', 'recusado', 'motivo_recusa', v_aluno.motivo_recusa);
    end if;
    return jsonb_build_object(
      'resultado', 'ok',
      'usuario', jsonb_build_object(
        'tipo', 'aluno',
        'cpf', v_aluno.cpf,
        'nome_completo', v_aluno.nome_completo,
        'status', v_aluno.status
      )
    );
  elsif v_mot_ok then
    return jsonb_build_object('resultado', 'tipo_incorreto', 'tipo_real', 'motorista');
  end if;
  return jsonb_build_object('resultado', 'invalido');
end;
$$;

revoke all on function public.login_usuario(text, text, text) from public;
grant execute on function public.login_usuario(text, text, text) to anon, authenticated;

-- Faz o PostgREST enxergar a nova função imediatamente.
notify pgrst, 'reload schema';
