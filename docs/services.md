# Services Endpoints

Услуги, которые оказывает организация (без привязки к найму — например, консультация, доставка, ремонт и т.д.).

## Price structure

Цена поддерживает те же типы, что и зарплата у вакансий, но **без** `period`:

| type | Поля | Пример отображения |
|---|---|---|
| `exact` | `amount` | 15 000 ₸ |
| `from` | `amount_from` | от 15 000 ₸ |
| `to` | `amount_to` | до 30 000 ₸ |
| `range` | `amount_from`, `amount_to` | от 15 000 до 30 000 ₸ |
| `negotiable` | — | Договорная |

**Общая форма объекта price:**
```json
{
    "type": "exact | from | to | range | negotiable",
    "amount": "number | null",
    "amount_from": "number | null",
    "amount_to": "number | null",
    "currency": "KZT | USD | EUR | string"
}
```

> Для `type: negotiable` — `amount`, `amount_from`, `amount_to` — `null`. Для `type: exact` — заполнен только `amount`. Для `type: from`/`to`/`range` — заполняются соответствующие поля.

---

## POST /v1/services
Создать услугу.

**Auth** needed (role: `manager` или `owner`)

**Request**
```json
{
    "title": "string",
    "description": "string (markdown)",
    "price": {
        "type": "exact | from | to | range | negotiable",
        "amount": "number | null",
        "amount_from": "number | null",
        "amount_to": "number | null",
        "currency": "KZT | USD | EUR | string"
    }
}
```

> `title` и `description` — оба хранятся и передаются как markdown-строки, форматирование рендерится на фронте.

**Response**
```json
{
    "service_id": "uuid",
    "title": "string (markdown)",
    "description": "string (markdown)",
    "price": {
        "type": "exact | from | to | range | negotiable",
        "amount": "number | null",
        "amount_from": "number | null",
        "amount_to": "number | null",
        "currency": "string"
    },
    "organization_id": "uuid",
    "created_by": "uuid",
    "created_at": "datetime"
}
```

---

## GET /v1/services
Список услуг (мобильное приложение, публичный просмотр).

**Auth** no need

**Query params:**
- `organization_id` — фильтр по организации

**Response**
```json
[
    {
        "service_id": "uuid",
        "title": "string (markdown)",
        "price": {
            "type": "exact | from | to | range | negotiable",
            "amount": "number | null",
            "amount_from": "number | null",
            "amount_to": "number | null",
            "currency": "string"
        },
        "organization_id": "uuid",
        "created_at": "datetime"
    }
]
```

---

## GET /v1/services/{service_id}
Детали услуги.

**Auth** no need

**Response**
```json
{
    "service_id": "uuid",
    "title": "string (markdown)",
    "description": "string (markdown)",
    "price": {
        "type": "exact | from | to | range | negotiable",
        "amount": "number | null",
        "amount_from": "number | null",
        "amount_to": "number | null",
        "currency": "string"
    },
    "organization_id": "uuid",
    "organization_name": "string",
    "created_by": "uuid",
    "created_at": "datetime"
}
```

---

## PATCH /v1/services/{service_id}
Обновить услугу.

**Auth** needed (role: `manager` или `owner`, в рамках своей `organization_id`)

**Request**
```json
{
    "title": "string (markdown)",
    "description": "string (markdown)",
    "price": {
        "type": "exact | from | to | range | negotiable",
        "amount": "number | null",
        "amount_from": "number | null",
        "amount_to": "number | null",
        "currency": "string"
    }
}
```

**Response**
```json
{
    "service_id": "uuid",
    "updated_at": "datetime"
}
```

---

## DELETE /v1/services/{service_id}
Удалить услугу.

**Auth** needed (role: `manager` или `owner`, в рамках своей `organization_id`)

**Response**
```json
{
    "success": true
}
```
