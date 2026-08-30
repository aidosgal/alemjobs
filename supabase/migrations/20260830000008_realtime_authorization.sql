-- Presence/Broadcast authorization (docs/chats.md: "Presence / Broadcast — для индикатора
-- 'печатает...' или 'онлайн'"). Postgres Changes is already authorized per-row via the RLS
-- policies on public.messages (20260830000006_chats.sql); this migration does the equivalent
-- for Presence/Broadcast channels, which are checked against realtime.messages instead.
--
-- Convention: client channel topic is `chat:{chat_id}` (same id used in the Postgres Changes
-- example in docs/chats.md), and the client must open it as a private channel, e.g.:
--   supabase.channel(`chat:${chatId}`, { config: { private: true } })
-- Non-participants won't be authorized to join, so they can't see typing/online events either.

create policy "chat_presence_broadcast_select_participant"
    on "realtime"."messages"
    for select
    to authenticated
    using (
        exists (
            select 1 from public.chats c
            where 'chat:' || c.chat_id::text = realtime.topic()
              and (c.user_id = auth.uid() or c.manager_id = auth.uid())
        )
    );

create policy "chat_presence_broadcast_insert_participant"
    on "realtime"."messages"
    for insert
    to authenticated
    with check (
        exists (
            select 1 from public.chats c
            where 'chat:' || c.chat_id::text = realtime.topic()
              and (c.user_id = auth.uid() or c.manager_id = auth.uid())
        )
    );
