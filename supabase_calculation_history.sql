-- Supabase SQL para tabela de histórico de cálculos
create table if not exists calculation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  steps jsonb not null, -- informações de cada etapa
  results jsonb not null, -- resultados finais
  charts jsonb, -- dados dos gráficos
  title text, -- opcional: nome dado pelo usuário
  description text -- opcional
);

create index if not exists idx_calculation_history_user_id on calculation_history(user_id);
