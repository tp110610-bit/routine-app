-- Supabase migration draft for the routine app MVP.
-- Paste this whole file into the Supabase SQL Editor and run it once per project.
-- docs/supabase-schema.md explains the design; this file is the SQL Editor script.
-- The app remains localStorage-first and only manual Supabase backup actions use these tables.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  log jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint routine_logs_user_date_key unique (user_id, date),
  constraint routine_logs_log_is_object check (jsonb_typeof(log) = 'object')
);

create index if not exists routine_logs_user_date_idx
  on public.routine_logs (user_id, date desc);

drop trigger if exists routine_logs_set_updated_at on public.routine_logs;
create trigger routine_logs_set_updated_at
before update on public.routine_logs
for each row
execute function public.set_updated_at();

alter table public.routine_logs enable row level security;

drop policy if exists "Users can view own routine logs" on public.routine_logs;
create policy "Users can view own routine logs"
on public.routine_logs
for select
using (user_id = auth.uid());

drop policy if exists "Users can insert own routine logs" on public.routine_logs;
create policy "Users can insert own routine logs"
on public.routine_logs
for insert
with check (user_id = auth.uid());

drop policy if exists "Users can update own routine logs" on public.routine_logs;
create policy "Users can update own routine logs"
on public.routine_logs
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own routine logs" on public.routine_logs;
create policy "Users can delete own routine logs"
on public.routine_logs
for delete
using (user_id = auth.uid());

create table if not exists public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_key text not null,
  label text not null,
  protein_grams numeric(8,2) not null default 0,
  unit_label text not null,
  category text not null,
  is_archived boolean not null default false,
  archived_at timestamptz default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint custom_foods_user_food_key_key unique (user_id, food_key),
  constraint custom_foods_food_key_not_blank check (length(btrim(food_key)) > 0),
  constraint custom_foods_label_not_blank check (length(btrim(label)) > 0),
  constraint custom_foods_unit_label_not_blank check (length(btrim(unit_label)) > 0),
  constraint custom_foods_protein_nonnegative check (protein_grams >= 0),
  constraint custom_foods_category_check check (
    category in ('protein', 'proteinMeal', 'fruit', 'vegetable', 'processed', 'snack')
  ),
  constraint custom_foods_archived_at_matches_state check (
    (is_archived = true) or (archived_at is null)
  )
);

create index if not exists custom_foods_user_archive_label_idx
  on public.custom_foods (user_id, is_archived, label);

drop trigger if exists custom_foods_set_updated_at on public.custom_foods;
create trigger custom_foods_set_updated_at
before update on public.custom_foods
for each row
execute function public.set_updated_at();

alter table public.custom_foods enable row level security;

drop policy if exists "Users can view own custom foods" on public.custom_foods;
create policy "Users can view own custom foods"
on public.custom_foods
for select
using (user_id = auth.uid());

drop policy if exists "Users can insert own custom foods" on public.custom_foods;
create policy "Users can insert own custom foods"
on public.custom_foods
for insert
with check (user_id = auth.uid());

drop policy if exists "Users can update own custom foods" on public.custom_foods;
create policy "Users can update own custom foods"
on public.custom_foods
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own custom foods" on public.custom_foods;
create policy "Users can delete own custom foods"
on public.custom_foods
for delete
using (user_id = auth.uid());

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  height_cm numeric(5,1) not null default 170.0,
  weight_kg numeric(5,1) not null default 70.0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_height_positive check (height_cm > 0),
  constraint user_profiles_weight_positive check (weight_kg > 0)
);

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

alter table public.user_profiles enable row level security;

drop policy if exists "Users can view own profile" on public.user_profiles;
create policy "Users can view own profile"
on public.user_profiles
for select
using (user_id = auth.uid());

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
on public.user_profiles
for insert
with check (user_id = auth.uid());

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
on public.user_profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own profile" on public.user_profiles;
create policy "Users can delete own profile"
on public.user_profiles
for delete
using (user_id = auth.uid());

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorite_food_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_favorite_food_ids_array check (
    jsonb_typeof(favorite_food_ids) = 'array'
  )
);

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

alter table public.user_preferences enable row level security;

drop policy if exists "Users can view own preferences" on public.user_preferences;
create policy "Users can view own preferences"
on public.user_preferences
for select
using (user_id = auth.uid());

drop policy if exists "Users can insert own preferences" on public.user_preferences;
create policy "Users can insert own preferences"
on public.user_preferences
for insert
with check (user_id = auth.uid());

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences"
on public.user_preferences
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own preferences" on public.user_preferences;
create policy "Users can delete own preferences"
on public.user_preferences
for delete
using (user_id = auth.uid());
