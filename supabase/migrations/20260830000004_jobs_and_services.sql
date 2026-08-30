create table public.jobs (
    job_id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations (organization_id) on delete cascade,
    created_by uuid not null references public.users (user_id) on delete restrict,
    title text not null,
    description text,
    -- { type: exact|from|to|range|negotiable, amount, amount_from, amount_to, period, currency } — docs/jobs.md
    salary jsonb not null check (salary ? 'type'),
    country text not null,
    city text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index jobs_organization_id_idx on public.jobs (organization_id);
create index jobs_country_city_idx on public.jobs (country, city);

create trigger jobs_set_updated_at
    before update on public.jobs
    for each row
    execute function public.set_updated_at();

create table public.services (
    service_id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations (organization_id) on delete cascade,
    created_by uuid not null references public.users (user_id) on delete restrict,
    title text not null,
    description text,
    -- { type: exact|from|to|range|negotiable, amount, amount_from, amount_to, currency } — docs/services.md
    price jsonb not null check (price ? 'type'),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index services_organization_id_idx on public.services (organization_id);

create trigger services_set_updated_at
    before update on public.services
    for each row
    execute function public.set_updated_at();

alter table public.jobs enable row level security;
alter table public.services enable row level security;

-- Jobs/services listings are public (mobile browsing, no auth) per docs/jobs.md and docs/services.md.
create policy "jobs_select_public"
    on public.jobs for select
    to anon, authenticated
    using (true);

create policy "jobs_write_org_staff"
    on public.jobs for all
    to authenticated
    using (
        (auth.jwt() ->> 'role') in ('manager', 'owner')
        and organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
    )
    with check (
        (auth.jwt() ->> 'role') in ('manager', 'owner')
        and organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
    );

create policy "services_select_public"
    on public.services for select
    to anon, authenticated
    using (true);

create policy "services_write_org_staff"
    on public.services for all
    to authenticated
    using (
        (auth.jwt() ->> 'role') in ('manager', 'owner')
        and organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
    )
    with check (
        (auth.jwt() ->> 'role') in ('manager', 'owner')
        and organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
    );
