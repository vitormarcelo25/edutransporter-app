-- Preferências de notificação por usuário (aluno ou motorista), chave = CPF.
-- Mesma tabela usada pelo backend Spring (PreferenciaNotificacao).
create table if not exists public.tb_preferencia_notificacao (
  cpf                varchar(14) primary key,
  avisos_importantes boolean not null default true,
  presenca           boolean not null default true,
  mensagens          boolean not null default true,
  rotas              boolean not null default true
);

alter table public.tb_preferencia_notificacao enable row level security;

drop policy if exists "app_pref_notificacao_rw" on public.tb_preferencia_notificacao;
create policy "app_pref_notificacao_rw" on public.tb_preferencia_notificacao
  for all to anon using (true) with check (true);

grant select, insert, update on public.tb_preferencia_notificacao to anon;
