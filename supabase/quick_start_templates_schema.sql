create extension if not exists pgcrypto;

create table if not exists public.quick_start_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  template_key text not null unique check (length(trim(template_key)) > 0),
  locked_dice_counting text not null check (locked_dice_counting in ('include', 'exclude')),
  sets jsonb not null check (jsonb_typeof(sets) = 'array'),
  combos jsonb not null default '[]'::jsonb check (jsonb_typeof(combos) = 'array'),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_quick_start_templates_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists quick_start_templates_updated_at on public.quick_start_templates;

create trigger quick_start_templates_updated_at
before update on public.quick_start_templates
for each row
execute function public.set_quick_start_templates_updated_at();

alter table public.quick_start_templates enable row level security;

drop policy if exists "Public can read published quick start templates" on public.quick_start_templates;
drop policy if exists "Admin can read all quick start templates" on public.quick_start_templates;
drop policy if exists "Admin can insert quick start templates" on public.quick_start_templates;
drop policy if exists "Admin can update quick start templates" on public.quick_start_templates;
drop policy if exists "Admin can delete quick start templates" on public.quick_start_templates;

create policy "Public can read published quick start templates"
on public.quick_start_templates
for select
using (is_published = true);

create policy "Admin can read all quick start templates"
on public.quick_start_templates
for select
using (auth.uid() = 'REPLACE_WITH_YOUR_ADMIN_USER_UUID'::uuid);

create policy "Admin can insert quick start templates"
on public.quick_start_templates
for insert
with check (auth.uid() = 'REPLACE_WITH_YOUR_ADMIN_USER_UUID'::uuid);

create policy "Admin can update quick start templates"
on public.quick_start_templates
for update
using (auth.uid() = 'REPLACE_WITH_YOUR_ADMIN_USER_UUID'::uuid)
with check (auth.uid() = 'REPLACE_WITH_YOUR_ADMIN_USER_UUID'::uuid);

create policy "Admin can delete quick start templates"
on public.quick_start_templates
for delete
using (auth.uid() = 'REPLACE_WITH_YOUR_ADMIN_USER_UUID'::uuid);
