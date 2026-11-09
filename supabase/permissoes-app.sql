-- Permissões que o app (chave pública) precisa para sincronizar entre aparelhos.
-- Rode no Supabase > SQL Editor SOMENTE se o app mostrar
-- "O servidor não permitiu..." ao salvar avisos, feriados, presença ou perfil.

alter table public.aviso    enable row level security;
alter table public.feriado  enable row level security;
alter table public.presenca enable row level security;

create policy "app_aviso_rw"    on public.aviso    for all to anon using (true) with check (true);
create policy "app_feriado_rw"  on public.feriado  for all to anon using (true) with check (true);
create policy "app_presenca_rw" on public.presenca for all to anon using (true) with check (true);

-- Edição de dados pessoais (Perfil > Dados Pessoais)
create policy "app_aluno_update"     on public.aluno     for update to anon using (true) with check (true);
create policy "app_motorista_update" on public.motorista for update to anon using (true) with check (true);
