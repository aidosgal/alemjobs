create table public.orders (
    order_id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    user_id uuid not null references public.users (user_id) on delete cascade,
    manager_id uuid not null references public.users (user_id) on delete restrict,
    organization_id uuid not null references public.organizations (organization_id) on delete cascade,
    job_id uuid references public.jobs (job_id) on delete set null,
    service_ids uuid[] not null default '{}',
    -- { amount, currency } — docs/orders.md (fixed agreed price, no from/to/period)
    price jsonb not null check (price ? 'amount'),
    deadline date,
    status public.order_status not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_organization_id_idx on public.orders (organization_id);
create index orders_manager_id_idx on public.orders (manager_id);

create trigger orders_set_updated_at
    before update on public.orders
    for each row
    execute function public.set_updated_at();

create table public.order_stages (
    stage_id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders (order_id) on delete cascade,
    title text not null,
    -- "order" is a reserved word, so the doc's `order` field is stored as `position`.
    position integer not null,
    status public.stage_status not null default 'pending',
    completed_at timestamptz
);

create index order_stages_order_id_idx on public.order_stages (order_id);

-- When every stage of an order is done/skipped, auto-complete the order
-- (docs/orders.md: "status заказа автоматически становится completed, когда все stages
-- переходят в done (или skipped)"). Manual completed/cancelled via PATCH is unaffected since
-- this only ever moves an `active` order to `completed`, never the reverse.
create or replace function public.check_order_completion()
returns trigger
language plpgsql
as $$
declare
    v_order_id uuid := coalesce(new.order_id, old.order_id);
    v_remaining int;
begin
    select count(*) into v_remaining
    from public.order_stages
    where order_id = v_order_id
      and status not in ('done', 'skipped');

    if v_remaining = 0 then
        update public.orders
        set status = 'completed'
        where order_id = v_order_id
          and status = 'active';
    end if;

    return new;
end;
$$;

create trigger order_stages_check_completion
    after insert or update or delete on public.order_stages
    for each row
    execute function public.check_order_completion();

alter table public.orders enable row level security;
alter table public.order_stages enable row level security;

create policy "orders_select_participant_or_staff"
    on public.orders for select
    to authenticated
    using (
        user_id = auth.uid()
        or (
            (auth.jwt() ->> 'role') in ('manager', 'owner')
            and organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
        )
    );

create policy "orders_insert_org_staff"
    on public.orders for insert
    to authenticated
    with check (
        (auth.jwt() ->> 'role') in ('manager', 'owner')
        and organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
        and manager_id = auth.uid()
    );

create policy "orders_update_org_staff"
    on public.orders for update
    to authenticated
    using (
        (auth.jwt() ->> 'role') in ('manager', 'owner')
        and organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
    )
    with check (
        (auth.jwt() ->> 'role') in ('manager', 'owner')
        and organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
    );

create policy "orders_delete_owner"
    on public.orders for delete
    to authenticated
    using (
        (auth.jwt() ->> 'role') = 'owner'
        and organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
    );

create policy "order_stages_select_participant_or_staff"
    on public.order_stages for select
    to authenticated
    using (
        exists (
            select 1 from public.orders o
            where o.order_id = order_stages.order_id
              and (
                  o.user_id = auth.uid()
                  or (
                      (auth.jwt() ->> 'role') in ('manager', 'owner')
                      and o.organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
                  )
              )
        )
    );

create policy "order_stages_write_org_staff"
    on public.order_stages for all
    to authenticated
    using (
        exists (
            select 1 from public.orders o
            where o.order_id = order_stages.order_id
              and (auth.jwt() ->> 'role') in ('manager', 'owner')
              and o.organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
        )
    )
    with check (
        exists (
            select 1 from public.orders o
            where o.order_id = order_stages.order_id
              and (auth.jwt() ->> 'role') in ('manager', 'owner')
              and o.organization_id = ((auth.jwt() ->> 'organization_id'))::uuid
        )
    );
