# Supabase Storage

Оба бакета — **приватные** (`public = false`). Клиент получает доступ через подписанные URL
(`createSignedUrl`) или через прямой запрос с JWT (для аутентифицированных пользователей RLS на
`storage.objects` разрешает доступ — см. `supabase/migrations/20260830000007_storage.sql`).
`file_size_limit` — 50MiB, как уже задано в `supabase/config.toml` (`[storage].file_size_limit`).

---

## `chat-attachments`

Вложения сообщений типа `image`/`pdf` (см. `docs/chats.md`).

**Path:** `chat-attachments/{chat_id}/{file_name}`

**Allowed MIME types:** `image/png`, `image/jpeg`, `application/pdf`

**Доступ:** только участники чата (`chats.user_id` или `chats.manager_id` = текущий пользователь).

**Flow:**
1. Клиент загружает файл в `chat-attachments/{chat_id}/{file_name}` (через Supabase client SDK, авторизованным запросом).
2. Получает путь/подписанный URL загруженного файла.
3. Отправляет `POST /v1/chats/{chat_id}/messages` с `type: "image" | "pdf"` и `attachment.file_url` = этот URL/путь (см. `docs/chats.md`).

---

## `organization-documents`

Учредительные документы организации (см. `docs/organization.md`: `registration_certificate`, `charter`, `other`).

**Path:** `organization-documents/{organization_id}/{file_name}`

**Allowed MIME types:** `application/pdf`, `image/png`, `image/jpeg`

**Доступ:** только `owner` соответствующей организации.

**Flow:**
1. `owner` загружает файл в `organization-documents/{organization_id}/{file_name}`.
2. Получает путь/подписанный URL.
3. Вызывает `POST /v1/organizations/documents` с `type` и `file_url` = этот URL/путь (см. `docs/organization.md`); документ сохраняется в таблице `organization_documents`.

---

## Почему приватные, а не публичные бакеты

И чаты, и юридические документы организации — приватные данные, доступ к которым должен
проверяться так же строго, как и к остальным данным в БД (RLS). Поэтому оба бакета приватные, а не
`public = true` — доступ выдаётся только через RLS-политики на `storage.objects` (по факту участия
в чате / владения организацией), а не всем по прямой ссылке.
