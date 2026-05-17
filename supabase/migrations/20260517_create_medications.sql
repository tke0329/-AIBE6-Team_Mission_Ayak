create extension if not exists pg_trgm;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.medications (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  dosage text not null,
  ingredient text,
  summary text not null,
  efficacy text not null,
  usage text[] not null default '{}',
  cautions text[] not null default '{}',
  side_effects text[] not null default '{}',
  storage text not null,
  source_provider text not null default 'manual',
  source_dataset text,
  source_item_id text,
  is_active boolean not null default true,
  search_text text generated always as (
    lower(
      concat_ws(
        ' ',
        name,
        category,
        dosage,
        ingredient,
        summary,
        efficacy,
        array_to_string(usage, ' '),
        array_to_string(cautions, ' '),
        array_to_string(side_effects, ' ')
      )
    )
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medications_slug_idx on public.medications (slug);
create index if not exists medications_is_active_idx on public.medications (is_active);
create index if not exists medications_search_text_trgm_idx
  on public.medications
  using gin (search_text gin_trgm_ops);

drop trigger if exists trg_medications_set_updated_at on public.medications;

create trigger trg_medications_set_updated_at
before update on public.medications
for each row
execute function public.set_current_timestamp_updated_at();

comment on table public.medications is 'AYAK 의약품 마스터 데이터';
comment on column public.medications.source_provider is '데이터 공급처 식별자 (예: mfds)';
comment on column public.medications.source_dataset is '공급처 세부 데이터셋명';
comment on column public.medications.source_item_id is '공급처 원본 레코드 식별자';
