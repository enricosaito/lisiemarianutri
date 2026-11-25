-- Profiles (one per auth user) + weekly check-in questionnaire.
-- Patients answer once per week (Monday-based, São Paulo time) and can edit
-- only the current week's answers. Admins read everything.

-- ── Profiles ────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'patient' check (role in ('patient', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: read own or admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- No insert/update policies: profiles are created by the trigger below and
-- roles are changed only from the Supabase dashboard / SQL.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill users created before this migration.
insert into public.profiles (id, email, full_name)
select id, email, raw_user_meta_data ->> 'full_name' from auth.users
on conflict (id) do nothing;

-- ── Weekly check-ins ────────────────────────────────────────────────────────

create function public.current_week_start()
returns date
language sql
stable
as $$
  select date_trunc('week', now() at time zone 'America/Sao_Paulo')::date;
$$;

create table public.weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  week_start date not null default public.current_week_start(),

  -- 1. Peso: negative = perdeu, positive = ganhou, null = não se pesou
  weight_change_kg numeric(4, 1) check (weight_change_kg between -30 and 30),
  -- 2–3. Nota da alimentação + motivo
  diet_score smallint not null check (diet_score between 0 and 10),
  diet_score_reason text not null,
  -- 4. Refeições livres
  free_meals_count smallint not null check (free_meals_count between 0 and 21),
  free_meals_details text,
  -- 5. Estresse / ansiedade
  stress text not null,
  -- 6. Treinos
  workouts_count smallint not null check (workouts_count between 0 and 21),
  workouts_details text,
  -- 7. Sono
  sleep text not null,
  -- 8. Água (litros/dia)
  water_liters numeric(3, 1) not null check (water_liters between 0 and 10),
  -- 9. Dificuldades com o plano
  plan_difficulties text not null,
  -- 10. Experiência no acompanhamento
  experience text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, week_start)
);

create index weekly_checkins_week_idx on public.weekly_checkins (week_start desc);

alter table public.weekly_checkins enable row level security;

create policy "checkins: read own or admin"
  on public.weekly_checkins for select
  to authenticated
  using (patient_id = auth.uid() or public.is_admin());

create policy "checkins: insert own for current week"
  on public.weekly_checkins for insert
  to authenticated
  with check (
    patient_id = auth.uid() and week_start = public.current_week_start()
  );

create policy "checkins: update own current week"
  on public.weekly_checkins for update
  to authenticated
  using (patient_id = auth.uid() and week_start = public.current_week_start())
  with check (
    patient_id = auth.uid() and week_start = public.current_week_start()
  );

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger weekly_checkins_touch
  before update on public.weekly_checkins
  for each row execute function public.touch_updated_at();
