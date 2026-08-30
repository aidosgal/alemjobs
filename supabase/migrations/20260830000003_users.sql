create table public.users (
    user_id uuid primary key default gen_random_uuid(),
    phone text not null unique,
    email text unique,
    password_hash text not null,
    first_name text not null,
    last_name text not null,
    role public.user_role not null default 'user',
    organization_id uuid references public.organizations (organization_id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index users_organization_id_idx on public.users (organization_id);

create trigger users_set_updated_at
    before update on public.users
    for each row
    execute function public.set_updated_at();

-- Now that public.users exists, wire up organizations.owner_id.
alter table public.organizations
    add constraint organizations_owner_id_fkey
    foreign key (owner_id) references public.users (user_id) on delete restrict;

create index organizations_owner_id_idx on public.organizations (owner_id);

-- Phone -> attempt_id -> confirm/register/reset-password flow (docs/auth.md, docs/user.md).
-- Rows are only ever written/read by trusted server-side code (service_role), never directly
-- by anon/authenticated clients, hence RLS is enabled with no policies (default deny).
create table public.login_attempts (
    attempt_id uuid primary key default gen_random_uuid(),
    phone text not null,
    user_id uuid references public.users (user_id) on delete cascade,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null default now() + interval '10 minutes',
    consumed_at timestamptz
);

create index login_attempts_phone_idx on public.login_attempts (phone);

alter table public.users enable row level security;
alter table public.login_attempts enable row level security;

-- Users: everyone can read their own row and update their own profile fields.
-- Row creation (register) and password changes go through service_role, not client policies.
create policy "users_select_self"
    on public.users for select
    to authenticated
    using (user_id = auth.uid());

create policy "users_update_self"
    on public.users for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- Managers/owners can see the other members of their own organization
-- (e.g. GET /v1/organizations/me's `managers` list).
create policy "users_select_org_members"
    on public.users for select
    to authenticated
    using (
        (auth.jwt() ->> 'role') in ('manager', 'owner')
        and organization_id is not null
        and organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
    );
