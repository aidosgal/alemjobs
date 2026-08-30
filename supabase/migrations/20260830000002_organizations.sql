-- Generates an 8-char uppercase alphanumeric invite code, e.g. "3F1A9BC2"
create or replace function public.generate_invite_code()
returns text
language sql
as $$
    select upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 8));
$$;

create table public.organizations (
    organization_id uuid primary key default gen_random_uuid(),
    name text not null,
    legal_name text,
    country text,
    city text,
    legal_form public.legal_form,
    bin_iin text,
    address text,
    timezone text not null default 'Asia/Almaty',
    working_hours jsonb,
    invite_code text not null unique default public.generate_invite_code(),
    -- FK to users(user_id) added in 20260830000003_users.sql, once that table exists.
    owner_id uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger organizations_set_updated_at
    before update on public.organizations
    for each row
    execute function public.set_updated_at();

create table public.organization_documents (
    document_id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations (organization_id) on delete cascade,
    type public.document_type not null,
    file_url text not null,
    uploaded_at timestamptz not null default now()
);

create index organization_documents_organization_id_idx on public.organization_documents (organization_id);

alter table public.organizations enable row level security;
alter table public.organization_documents enable row level security;

-- Organizations: readable by any authenticated member (owner/managers via users.organization_id),
-- writable only by the owner.
create policy "organizations_select_members"
    on public.organizations for select
    to authenticated
    using (
        organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
    );

create policy "organizations_update_owner"
    on public.organizations for update
    to authenticated
    using (owner_id = auth.uid())
    with check (owner_id = auth.uid());

create policy "organizations_insert_self"
    on public.organizations for insert
    to authenticated
    with check (owner_id = auth.uid());

-- Organization documents: readable/writable by the organization's owner only.
create policy "organization_documents_all_owner"
    on public.organization_documents for all
    to authenticated
    using (
        exists (
            select 1 from public.organizations o
            where o.organization_id = organization_documents.organization_id
              and o.owner_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.organizations o
            where o.organization_id = organization_documents.organization_id
              and o.owner_id = auth.uid()
        )
    );
