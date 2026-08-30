# Chat Endpoints

## Realtime (вместо кастомного WebSocket)

Supabase Realtime уже даёт WebSocket "из коробки" — свой сервер поднимать не нужно.

Два способа, которые тут пригодятся:

1. **Postgres Changes** — подписка на изменения в таблице `messages`, отфильтрованная по `chat_id`. Подходит для получения новых сообщений в реальном времени.
2. **Presence / Broadcast** — для индикатора "печатает..." или "онлайн".

**Пример подписки на новые сообщения (клиент, JS/TS):**
```typescript
const channel = supabase
  .channel(`chat:${chatId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`
    },
    (payload) => {
      // новое сообщение пришло
      console.log(payload.new)
    }
  )
  .subscribe()
```

> Для этого таблица `messages` должна быть добавлена в Realtime publication (`supabase_realtime`) в Supabase Dashboard → Database → Replication, либо через SQL:
> ```sql
> alter publication supabase_realtime add table messages;
> ```

> Доступ к чужим сообщениям ограничивается через RLS-политику на таблице `messages` (участник чата — либо `user_id`, либо `manager_id`).

REST-эндпоинты ниже нужны для истории сообщений (пагинация), отправки медиа (через Storage) и отправки structured-сообщений (job/service/order) — Realtime сам по себе только уведомляет о новых записях, отправка всё равно идёт через API/insert.

---

## Chat structure

```json
{
    "chat_id": "uuid",
    "user_id": "uuid",
    "manager_id": "uuid",
    "organization_id": "uuid",
    "job_id": "uuid",
    "status": "active | closed",
    "last_message_at": "datetime",
    "created_at": "datetime"
}
```

## Message structure

```json
{
    "message_id": "uuid",
    "chat_id": "uuid",
    "sender_id": "uuid",
    "sender_role": "user | manager | owner",
    "type": "text | job | service | order | image | pdf",
    "text": "string | null",
    "attachment": {
        "ref_id": "uuid | null",
        "file_url": "string | null",
        "file_name": "string | null"
    },
    "created_at": "datetime"
}
```

**Типы сообщений:**

| type | Что содержит | Пояснение |
|---|---|---|
| `text` | `text` | Обычное текстовое сообщение |
| `job` | `attachment.ref_id` = `job_id` | Карточка вакансии внутри чата |
| `service` | `attachment.ref_id` = `service_id` | Карточка услуги внутри чата |
| `order` | `attachment.ref_id` = `order_id` | Карточка заказа (используется, чтобы предложить клиенту оплатить — фронт рендерит кнопку "Оплатить" на основе `order.price`) |
| `image` | `attachment.file_url`, `file_name` | Изображение (JPG/PNG), файл лежит в Supabase Storage |
| `pdf` | `attachment.file_url`, `file_name` | PDF-документ, файл лежит в Supabase Storage |

> Файлы (`image`/`pdf`) сначала загружаются в Supabase Storage (bucket, например `chat-attachments`), затем в сообщение передаётся публичный/подписанный `file_url`.

---

## POST /v1/jobs/{job_id}/apply
Отклик пользователя на вакансию. Создаёт чат (если ещё не создан) с одним из менеджеров организации и автоматически отправляет первое сообщение с карточкой вакансии.

**Auth** needed (role: `user`)

**Логика подбора менеджера:**
Среди `manager`/`owner` организации, к которой относится вакансия, выбирается тот, у кого сейчас меньше всего активных чатов (`status: active`) — простое распределение нагрузки round-robin/least-loaded. Пользователь менеджера не выбирает сам.

> Если чат с этой вакансией у пользователя уже существует — возвращается существующий чат, новый не создаётся и повторное авто-сообщение не отправляется.

**Request** — тело не требуется, `job_id` в URL.

**Response**
```json
{
    "chat_id": "uuid",
    "user_id": "uuid",
    "manager_id": "uuid",
    "organization_id": "uuid",
    "job_id": "uuid",
    "status": "active",
    "created_at": "datetime"
}
```

---

## GET /v1/chats
Список чатов текущего пользователя.

**Auth** needed

> Для `role: user` — чаты, где `user_id` = текущий пользователь.
> Для `role: manager | owner` — чаты, где `manager_id` = текущий пользователь (owner видит только свои чаты, не все чаты организации — если нужно иначе, уточни).

**Response**
```json
[
    {
        "chat_id": "uuid",
        "user_id": "uuid",
        "manager_id": "uuid",
        "job_id": "uuid",
        "status": "active | closed",
        "last_message": {
            "type": "text | job | service | order | image | pdf",
            "text": "string | null",
            "created_at": "datetime"
        },
        "last_message_at": "datetime"
    }
]
```

---

## GET /v1/chats/{chat_id}/messages
История сообщений чата (пагинация).

**Auth** needed (участник чата: `user_id` или `manager_id`)

**Query params:**
- `before` — `created_at` последнего полученного сообщения, для подгрузки более старых
- `limit` — по умолчанию 30

**Response**
```json
[
    {
        "message_id": "uuid",
        "sender_id": "uuid",
        "sender_role": "user | manager | owner",
        "type": "text | job | service | order | image | pdf",
        "text": "string | null",
        "attachment": {
            "ref_id": "uuid | null",
            "file_url": "string | null",
            "file_name": "string | null"
        },
        "created_at": "datetime"
    }
]
```

---

## POST /v1/chats/{chat_id}/messages
Отправить сообщение.

**Auth** needed (участник чата: `user_id` или `manager_id`)

**Request (текст)**
```json
{
    "type": "text",
    "text": "string"
}
```

**Request (вакансия/услуга/заказ)**
```json
{
    "type": "job | service | order",
    "attachment": {
        "ref_id": "uuid"
    }
}
```

**Request (медиа)**
```json
{
    "type": "image | pdf",
    "attachment": {
        "file_url": "string",
        "file_name": "string"
    }
}
```

> Для `image`/`pdf` — `file_url` получается заранее через загрузку в Supabase Storage (отдельный upload-запрос на клиенте до отправки сообщения).

**Response**
```json
{
    "message_id": "uuid",
    "chat_id": "uuid",
    "sender_id": "uuid",
    "type": "text | job | service | order | image | pdf",
    "created_at": "datetime"
}
```

---

## PATCH /v1/chats/{chat_id}
Изменить статус чата (например, закрыть).

**Auth** needed (role: `manager` или `owner`, участник чата)

**Request**
```json
{
    "status": "active | closed"
}
```

**Response**
```json
{
    "chat_id": "uuid",
    "status": "active | closed"
}
```
