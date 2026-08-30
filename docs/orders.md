# Orders Endpoints

Order — сопровождение конкретного пользователя (соискателя) по вакансии и/или услугам организации: трудоустройство за рубежом, оформление приглашения, визы и т.д. Ведётся менеджером/владельцем организации.

## Order structure

```json
{
    "order_id": "uuid",
    "title": "string (markdown)",
    "description": "string (markdown)",
    "user_id": "uuid",
    "manager_id": "uuid",
    "organization_id": "uuid",
    "job_id": "uuid | null",
    "service_ids": ["uuid"],
    "price": {
        "amount": "number",
        "currency": "KZT | USD | EUR | string"
    },
    "deadline": "date | null",
    "status": "active | completed | cancelled",
    "stages": [
        {
            "stage_id": "uuid",
            "title": "string",
            "order": "number",
            "status": "pending | in_progress | done | skipped",
            "completed_at": "datetime | null"
        }
    ],
    "created_at": "datetime"
}
```

> `price` — фиксированная согласованная сумма (без `from/to`, т.к. это уже итог договорённости), без `period`.

> `job_id` — опционален (заказ может быть привязан к конкретной вакансии). `service_ids` — массив, может содержать одну или несколько услуг, либо быть пустым, если заказ идёт только по вакансии.

> `status` заказа автоматически становится `completed`, когда все `stages` переходят в `done` (или `skipped`). Менеджер также может выставить `completed`/`cancelled` вручную через `PATCH /v1/orders/{order_id}`.

---

## Default stages (шаблон для трудоустройства за рубежом)

Работодатель (manager/owner) может использовать дефолтный набор этапов или задать свои. Дефолтный список ориентирован на выезд из Казахстана в Европу:

1. Заявка принята
2. Ожидание оплаты от клиента
3. Сбор документов
4. Проверка/собеседование с работодателем
5. Подготовка приглашения (invitation letter)
6. Подача на визу
7. Виза одобрена
8. Оформление билетов/переезда
9. Трудоустройство подтверждено

> Этап "Ожидание оплаты от клиента" блокирует переход к следующим этапам, пока менеджер вручную не отметит его `done` (после поступления оплаты). Оплата обрабатывается вне системы — здесь фиксируется только факт/статус ожидания.

## GET /v1/orders/stages/default
Получить дефолтный шаблон этапов.

**Auth** needed (role: `manager` или `owner`)

**Response**
```json
{
    "stages": [
        { "title": "Заявка принята", "order": 1 },
        { "title": "Ожидание оплаты от клиента", "order": 2 },
        { "title": "Сбор документов", "order": 3 },
        { "title": "Проверка/собеседование с работодателем", "order": 4 },
        { "title": "Подготовка приглашения (invitation letter)", "order": 5 },
        { "title": "Подача на визу", "order": 6 },
        { "title": "Виза одобрена", "order": 7 },
        { "title": "Оформление билетов/переезда", "order": 8 },
        { "title": "Трудоустройство подтверждено", "order": 9 }
    ]
}
```

---

## POST /v1/orders
Создать заказ.

**Auth** needed (role: `manager` или `owner`)

**Request**
```json
{
    "title": "string (markdown)",
    "description": "string (markdown)",
    "user_id": "uuid",
    "job_id": "uuid | null",
    "service_ids": ["uuid"],
    "price": {
        "amount": "number",
        "currency": "KZT | USD | EUR | string"
    },
    "deadline": "date | null",
    "stages": [
        {
            "title": "string",
            "order": "number"
        }
    ]
}
```

> Если `stages` не передан — подставляется дефолтный шаблон (см. выше). `manager_id` и `organization_id` берутся из авторизованного пользователя, в теле запроса не передаются.

**Response**
```json
{
    "order_id": "uuid",
    "title": "string (markdown)",
    "description": "string (markdown)",
    "user_id": "uuid",
    "manager_id": "uuid",
    "organization_id": "uuid",
    "job_id": "uuid | null",
    "service_ids": ["uuid"],
    "price": {
        "amount": "number",
        "currency": "string"
    },
    "deadline": "date | null",
    "status": "active",
    "stages": [
        {
            "stage_id": "uuid",
            "title": "string",
            "order": "number",
            "status": "pending",
            "completed_at": null
        }
    ],
    "created_at": "datetime"
}
```

---

## GET /v1/orders
Список заказов.

**Auth** needed

> Для `role: user` — возвращаются только заказы, где `user_id` = текущий пользователь.
> Для `role: manager | owner` — возвращаются заказы своей `organization_id`.

**Query params:**
- `status` — фильтр по статусу (`active | completed | cancelled`)

**Response**
```json
[
    {
        "order_id": "uuid",
        "title": "string (markdown)",
        "user_id": "uuid",
        "manager_id": "uuid",
        "organization_id": "uuid",
        "job_id": "uuid | null",
        "price": {
            "amount": "number",
            "currency": "string"
        },
        "deadline": "date | null",
        "status": "active | completed | cancelled",
        "created_at": "datetime"
    }
]
```

---

## GET /v1/orders/{order_id}
Детали заказа.

**Auth** needed (участник заказа: `user_id`, либо `manager`/`owner` этой `organization_id`)

**Response**
```json
{
    "order_id": "uuid",
    "title": "string (markdown)",
    "description": "string (markdown)",
    "user_id": "uuid",
    "manager_id": "uuid",
    "organization_id": "uuid",
    "job_id": "uuid | null",
    "service_ids": ["uuid"],
    "price": {
        "amount": "number",
        "currency": "string"
    },
    "deadline": "date | null",
    "status": "active | completed | cancelled",
    "stages": [
        {
            "stage_id": "uuid",
            "title": "string",
            "order": "number",
            "status": "pending | in_progress | done | skipped",
            "completed_at": "datetime | null"
        }
    ],
    "created_at": "datetime"
}
```

---

## PATCH /v1/orders/{order_id}
Обновить основные данные заказа.

**Auth** needed (role: `manager` или `owner`, в рамках своей `organization_id`)

**Request**
```json
{
    "title": "string (markdown)",
    "description": "string (markdown)",
    "job_id": "uuid | null",
    "service_ids": ["uuid"],
    "price": {
        "amount": "number",
        "currency": "string"
    },
    "deadline": "date | null",
    "status": "active | completed | cancelled"
}
```

**Response**
```json
{
    "order_id": "uuid",
    "updated_at": "datetime"
}
```

---

## POST /v1/orders/{order_id}/stages
Добавить этап в заказ.

**Auth** needed (role: `manager` или `owner`, в рамках своей `organization_id`)

**Request**
```json
{
    "title": "string",
    "order": "number"
}
```

**Response**
```json
{
    "stage_id": "uuid",
    "title": "string",
    "order": "number",
    "status": "pending"
}
```

---

## PATCH /v1/orders/{order_id}/stages/{stage_id}
Обновить этап (например, отметить выполненным).

**Auth** needed (role: `manager` или `owner`, в рамках своей `organization_id`)

**Request**
```json
{
    "title": "string",
    "order": "number",
    "status": "pending | in_progress | done | skipped"
}
```

**Response**
```json
{
    "stage_id": "uuid",
    "status": "pending | in_progress | done | skipped",
    "completed_at": "datetime | null"
}
```

---

## DELETE /v1/orders/{order_id}/stages/{stage_id}
Удалить этап.

**Auth** needed (role: `manager` или `owner`, в рамках своей `organization_id`)

**Response**
```json
{
    "success": true
}
```

---

## DELETE /v1/orders/{order_id}
Удалить заказ.

**Auth** needed (role: `owner`)

**Response**
```json
{
    "success": true
}
```
