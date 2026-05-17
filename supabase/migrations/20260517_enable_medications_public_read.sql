alter table public.medications enable row level security;

drop policy if exists "public can read active medications" on public.medications;

create policy "public can read active medications"
on public.medications
for select
to anon, authenticated
using (is_active = true);
