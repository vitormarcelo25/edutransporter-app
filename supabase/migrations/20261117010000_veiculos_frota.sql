-- =====================================================================
-- EduTransporte - Gestão de Veículos da Frota
-- Rode este arquivo no Supabase > SQL Editor (idempotente).
-- =====================================================================

-- 1. Colunas de capacidade, tipo e status ativo em public.veiculo
alter table public.veiculo add column if not exists capacidade integer not null default 40;
alter table public.veiculo add column if not exists tipo text not null default 'Ônibus';
alter table public.veiculo add column if not exists ativo boolean not null default true;

-- 2. Permissões completas para CRUD de veículos pelo painel administrativo
grant select, insert, update, delete on public.veiculo to anon, authenticated;

-- 3. Garante que a policy de acesso exista em veiculo
alter table public.veiculo enable row level security;
drop policy if exists app_acesso on public.veiculo;
create policy app_acesso on public.veiculo
  for all to anon, authenticated
  using (true)
  with check (true);

notify pgrst, 'reload schema';
