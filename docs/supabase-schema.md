# Supabase Schema Draft

This document explains the Supabase schema and app mapping for the routine app.

## Current Integration State

- The upper-right account menu contains Supabase Auth UI for email/password sign-up, login, and logout.
- The same account menu contains manual upload/download UI for Supabase backups.
- Automatic sync, realtime sync, and app-start pull/push are not implemented.
- `localStorage` remains the app's default storage and source of truth.
- Routine table reads and writes happen only after the user triggers a manual Supabase backup action.

## Document Roles

- `docs/supabase-schema.md` is the design and explanation document for tables, mapping, and integration boundaries.
- `docs/supabase-migration.sql` is the SQL file intended for the Supabase SQL Editor.
- Treat the SQL block in this document as design context. Use the migration file when applying the current MVP schema.

## Design Goals

- Keep the MVP schema simple enough for a personal app.
- Use `auth.users(id)` as the source of ownership and isolate all rows by `user_id`.
- Store daily routine logs as `jsonb` so `DailyRoutineLog` can evolve without frequent migrations.
- Keep `custom_foods` relational because custom foods need search, archive management, and future list views.
- Keep `user_profiles` and `user_preferences` as one row per user for easy upsert.
- Preserve compatibility with `RoutineBackupData 1.1`.

## Recommended Tables

### `routine_logs`

Purpose: Stores one normalized daily routine log per user and date.

| Column | Type | Nullable | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | None | References `auth.users(id)` |
| `date` | `date` | No | None | Routine date |
| `log` | `jsonb` | No | None | Full `DailyRoutineLog` object |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp |
| `updated_at` | `timestamptz` | No | `now()` | Updated by trigger |

Constraints and indexes:

- Primary key: `id`
- Unique constraint: `(user_id, date)`
- Index: `(user_id, date desc)` for recent history and weekly reports
- Optional future index: `gin (log)` only if jsonb search becomes necessary

RLS direction:

- Enable RLS.
- Users can select, insert, update, and delete only rows where `user_id = auth.uid()`.
- Inserts should require `with check (user_id = auth.uid())`.

### `custom_foods`

Purpose: Stores user-created foods, including archived foods that remain available for historical records.

| Column | Type | Nullable | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Database primary key |
| `user_id` | `uuid` | No | None | References `auth.users(id)` |
| `food_key` | `text` | No | None | App-level food id, for example `custom-food-tofu` |
| `label` | `text` | No | None | Display name |
| `protein_grams` | `numeric(8,2)` | No | `0` | Protein per unit |
| `unit_label` | `text` | No | None | Serving unit label |
| `category` | `text` | No | None | One of the app nutrition categories |
| `is_archived` | `boolean` | No | `false` | Preserves archived status |
| `archived_at` | `timestamptz` | Yes | `null` | Archive timestamp |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp |
| `updated_at` | `timestamptz` | No | `now()` | Updated by trigger |

Constraints and indexes:

- Primary key: `id`
- Unique constraint: `(user_id, food_key)`
- Check constraint for `category`
- Index: `(user_id, is_archived, label)` for current food lists
- Index: `(user_id, food_key)` is covered by the unique constraint

RLS direction:

- Enable RLS.
- Users can select, insert, update, and delete only their own custom foods.
- Hard delete can stay allowed by policy, but the app should continue using archive-first behavior.

### `user_profiles`

Purpose: Stores the current profile values used by recommendations, currently `heightCm` and `weightKg`.

| Column | Type | Nullable | Default | Notes |
| --- | --- | --- | --- | --- |
| `user_id` | `uuid` | No | None | Primary key, references `auth.users(id)` |
| `height_cm` | `numeric(5,1)` | No | `170.0` | Mirrors `profile.heightCm` |
| `weight_kg` | `numeric(5,1)` | No | `70.0` | Mirrors `profile.weightKg` |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp |
| `updated_at` | `timestamptz` | No | `now()` | Updated by trigger |

Constraints and indexes:

- Primary key: `user_id`
- Check constraints: positive `height_cm`, positive `weight_kg`
- No extra index needed for MVP because the primary key covers user lookup

RLS direction:

- Enable RLS.
- Users can select, insert, update, and delete only their own profile row.
- App integration should use upsert by `user_id`.

### `user_preferences`

Purpose: Stores small user-level app preferences that do not need separate relational management.

| Column | Type | Nullable | Default | Notes |
| --- | --- | --- | --- | --- |
| `user_id` | `uuid` | No | None | Primary key, references `auth.users(id)` |
| `favorite_food_ids` | `jsonb` | No | `'[]'::jsonb` | Mirrors `favoriteFoodIds: string[]` |
| `created_at` | `timestamptz` | No | `now()` | Insert timestamp |
| `updated_at` | `timestamptz` | No | `now()` | Updated by trigger |

Constraints and indexes:

- Primary key: `user_id`
- Check constraint: `jsonb_typeof(favorite_food_ids) = 'array'`
- No extra index needed for MVP because preferences are fetched by `user_id`

RLS direction:

- Enable RLS.
- Users can select, insert, update, and delete only their own preferences row.
- App integration should use upsert by `user_id`.

## Favorite Food Storage Recommendation

Use `user_preferences.favorite_food_ids jsonb` for the current app scale.

Reasoning:

- `favoriteFoodIds` is currently a small ordered `string[]`.
- The app only needs to load and replace the list, not query favorites across users.
- It keeps the MVP schema smaller and sync logic simpler.
- It preserves app-level keys for both built-in foods and custom foods.

Alternative:

- A separate `favorite_foods` table with `(user_id, food_id, sort_order)` would be useful later if favorites need auditing, per-food metadata, sharing, or database-level joins. It is not necessary before Supabase MVP integration.

## Mapping From App Data

### `DailyRoutineLog`

`DailyRoutineLog` maps directly to `routine_logs.log`.

- `routine_logs.date` duplicates `log.date` as a real `date` column for unique constraints and efficient history queries.
- `routine_logs.log` stores the complete object:
  - `date`
  - `diet`
  - `training`
  - `faith`
  - `hobby`
  - `scores`
- On read, the app can reconstruct `DailyRoutineLog[]` by selecting rows ordered by `date`.

### `RoutineBackupData 1.1`

`RoutineBackupData 1.1` maps as follows:

| Backup field | Supabase target |
| --- | --- |
| `version` | Not required per row; keep in client import/export metadata |
| `exportedAt` | Not required per row; keep in backup files |
| `logs` | `routine_logs.log`, one row per log |
| `customFoods` | `custom_foods`, one row per custom food |
| `profile` | `user_profiles` |
| `favoriteFoodIds` | `user_preferences.favorite_food_ids` |

The database schema should not depend on backup file metadata. Backup versioning remains a client-side import/export concern.

## SQL Draft

This draft keeps the schema discussion close to the design notes. For an executable, rerunnable SQL Editor script, use `docs/supabase-migration.sql`.

```sql
-- Required for gen_random_uuid().
create extension if not exists pgcrypto;

-- Shared updated_at trigger.
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
  log jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint routine_logs_user_date_key unique (user_id, date),
  constraint routine_logs_log_is_object check (jsonb_typeof(log) = 'object')
);

create index if not exists routine_logs_user_date_idx
  on public.routine_logs (user_id, date desc);

create trigger routine_logs_set_updated_at
before update on public.routine_logs
for each row
execute function public.set_updated_at();

alter table public.routine_logs enable row level security;

create policy "Users can view own routine logs"
on public.routine_logs
for select
using (user_id = auth.uid());

create policy "Users can insert own routine logs"
on public.routine_logs
for insert
with check (user_id = auth.uid());

create policy "Users can update own routine logs"
on public.routine_logs
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

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
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint custom_foods_user_food_key_key unique (user_id, food_key),
  constraint custom_foods_food_key_not_blank check (length(btrim(food_key)) > 0),
  constraint custom_foods_label_not_blank check (length(btrim(label)) > 0),
  constraint custom_foods_unit_label_not_blank check (length(btrim(unit_label)) > 0),
  constraint custom_foods_protein_nonnegative check (protein_grams >= 0),
  constraint custom_foods_category_check check (
    category in ('protein', 'proteinMeal', 'fruit', 'vegetable', 'processed', 'snack')
  )
);

create index if not exists custom_foods_user_archive_label_idx
  on public.custom_foods (user_id, is_archived, label);

create trigger custom_foods_set_updated_at
before update on public.custom_foods
for each row
execute function public.set_updated_at();

alter table public.custom_foods enable row level security;

create policy "Users can view own custom foods"
on public.custom_foods
for select
using (user_id = auth.uid());

create policy "Users can insert own custom foods"
on public.custom_foods
for insert
with check (user_id = auth.uid());

create policy "Users can update own custom foods"
on public.custom_foods
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

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

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
on public.user_profiles
for select
using (user_id = auth.uid());

create policy "Users can insert own profile"
on public.user_profiles
for insert
with check (user_id = auth.uid());

create policy "Users can update own profile"
on public.user_profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

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

create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

alter table public.user_preferences enable row level security;

create policy "Users can view own preferences"
on public.user_preferences
for select
using (user_id = auth.uid());

create policy "Users can insert own preferences"
on public.user_preferences
for insert
with check (user_id = auth.uid());

create policy "Users can update own preferences"
on public.user_preferences
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own preferences"
on public.user_preferences
for delete
using (user_id = auth.uid());
```

## Integration Notes

- Use `upsert` for `routine_logs` with conflict target `(user_id, date)`.
- Use `upsert` for `custom_foods` with conflict target `(user_id, food_key)`.
- Use `upsert` for `user_profiles` and `user_preferences` with conflict target `user_id`.
- Keep sync manual unless the storage ownership model changes beyond the local-first MVP.
- Keep local import/export normalization as the boundary for legacy backup compatibility.
- Before production use, test RLS with at least two auth users to confirm cross-user isolation.

## Environment Variables

Add these values to `.env.local` for local development and to the Vercel project environment variables before enabling Supabase sync:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

These are public browser keys. Do not commit `.env.local`.
