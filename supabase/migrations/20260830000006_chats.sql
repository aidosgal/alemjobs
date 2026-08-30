create table public.chats (
    chat_id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users (user_id) on delete cascade,
    manager_id uuid not null references public.users (user_id) on delete restrict,
    organization_id uuid not null references public.organizations (organization_id) on delete cascade,
    job_id uuid references public.jobs (job_id) on delete set null,
    status public.chat_status not null default 'active',
    last_message_at timestamptz,
    created_at timestamptz not null default now()
);

-- docs/chats.md: applying to the same job twice returns the existing chat instead of a new one.
create unique index chats_user_id_job_id_key
    on public.chats (user_id, job_id)
    where job_id is not null;

create index chats_manager_id_idx on public.chats (manager_id);
create index chats_organization_id_idx on public.chats (organization_id);

create table public.messages (
    message_id uuid primary key default gen_random_uuid(),
    chat_id uuid not null references public.chats (chat_id) on delete cascade,
    sender_id uuid not null references public.users (user_id) on delete cascade,
    sender_role public.user_role not null,
    type public.message_type not null,
    text text,
    -- { ref_id, file_url, file_name } — docs/chats.md
    attachment jsonb,
    created_at timestamptz not null default now()
);

create index messages_chat_id_created_at_idx on public.messages (chat_id, created_at);

-- Keep chats.last_message_at in sync so GET /v1/chats can sort/display without re-aggregating messages.
create or replace function public.touch_chat_last_message_at()
returns trigger
language plpgsql
as $$
begin
    update public.chats
    set last_message_at = new.created_at
    where chat_id = new.chat_id;
    return new;
end;
$$;

create trigger messages_touch_chat
    after insert on public.messages
    for each row
    execute function public.touch_chat_last_message_at();

-- Realtime: docs/chats.md relies on Postgres Changes on `messages` for live delivery.
alter publication supabase_realtime add table public.messages;

alter table public.chats enable row level security;
alter table public.messages enable row level security;

create policy "chats_select_participant"
    on public.chats for select
    to authenticated
    using (user_id = auth.uid() or manager_id = auth.uid());

create policy "chats_insert_applicant"
    on public.chats for insert
    to authenticated
    with check (
        user_id = auth.uid()
        and (auth.jwt() ->> 'role') = 'user'
    );

create policy "chats_update_staff_participant"
    on public.chats for update
    to authenticated
    using (
        manager_id = auth.uid()
        and (auth.jwt() ->> 'role') in ('manager', 'owner')
    )
    with check (
        manager_id = auth.uid()
        and (auth.jwt() ->> 'role') in ('manager', 'owner')
    );

create policy "messages_select_participant"
    on public.messages for select
    to authenticated
    using (
        exists (
            select 1 from public.chats c
            where c.chat_id = messages.chat_id
              and (c.user_id = auth.uid() or c.manager_id = auth.uid())
        )
    );

create policy "messages_insert_participant"
    on public.messages for insert
    to authenticated
    with check (
        sender_id = auth.uid()
        and exists (
            select 1 from public.chats c
            where c.chat_id = messages.chat_id
              and (c.user_id = auth.uid() or c.manager_id = auth.uid())
        )
    );
