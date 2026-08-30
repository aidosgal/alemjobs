-- Extensions
create extension if not exists "pgcrypto" with schema extensions;

-- Enums
create type public.user_role as enum ('user', 'manager', 'owner');
create type public.legal_form as enum ('ip', 'too', 'other');
create type public.document_type as enum ('registration_certificate', 'charter', 'other');
create type public.chat_status as enum ('active', 'closed');
create type public.message_type as enum ('text', 'job', 'service', 'order', 'image', 'pdf');
create type public.order_status as enum ('active', 'completed', 'cancelled');
create type public.stage_status as enum ('pending', 'in_progress', 'done', 'skipped');

-- Shared trigger: keep updated_at current on row updates
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

