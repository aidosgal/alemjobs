-- Buckets used across the API — see docs/supabase/storage.md for the full path convention.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
    ('chat-attachments', 'chat-attachments', false, 52428800, array['image/png', 'image/jpeg', 'application/pdf']),
    ('organization-documents', 'organization-documents', false, 52428800, array['application/pdf', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;

-- chat-attachments/{chat_id}/{file_name}: readable/writable only by that chat's two participants.
create policy "chat_attachments_participant_select"
    on storage.objects for select
    to authenticated
    using (
        bucket_id = 'chat-attachments'
        and exists (
            select 1 from public.chats c
            where c.chat_id::text = (storage.foldername(name))[1]
              and (c.user_id = auth.uid() or c.manager_id = auth.uid())
        )
    );

create policy "chat_attachments_participant_insert"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'chat-attachments'
        and exists (
            select 1 from public.chats c
            where c.chat_id::text = (storage.foldername(name))[1]
              and (c.user_id = auth.uid() or c.manager_id = auth.uid())
        )
    );

-- organization-documents/{organization_id}/{file_name}: only that organization's owner.
create policy "organization_documents_owner_all"
    on storage.objects for all
    to authenticated
    using (
        bucket_id = 'organization-documents'
        and exists (
            select 1 from public.organizations o
            where o.organization_id::text = (storage.foldername(name))[1]
              and o.owner_id = auth.uid()
        )
    )
    with check (
        bucket_id = 'organization-documents'
        and exists (
            select 1 from public.organizations o
            where o.organization_id::text = (storage.foldername(name))[1]
              and o.owner_id = auth.uid()
        )
    );
