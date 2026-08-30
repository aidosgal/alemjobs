# Jobs Endpoints

## Salary structure

Зарплата поддерживает несколько типов отображения:

| type | Поля | Пример отображения |
|---|---|---|
| `exact` | `amount` | 300 000 ₸ / месяц |
| `from` | `amount_from` | от 300 000 ₸ / месяц |
| `to` | `amount_to` | до 500 000 ₸ / месяц |
| `range` | `amount_from`, `amount_to` | от 300 000 до 500 000 ₸ / месяц |
| `negotiable` | — | Договорная |

**Общая форма объекта salary:**
```json
{
    "type": "exact | from | to | range | negotiable",
    "amount": "number | null",
    "amount_from": "number | null",
    "amount_to": "number | null",
    "period": "hour | week | month | year",
    "currency": "KZT | USD | EUR | string"
}
```

> Для `type: negotiable` — `amount`, `amount_from`, `amount_to` — `null`. Для `type: exact` — заполнен только `amount`. Для `type: from`/`to`/`range` — заполняются соответствующие поля.

---

## POST /v1/jobs
Создать вакансию.

**Auth** needed (role: `manager` или `owner`)

**Request**
```json
{
    "title": "string",
    "description": "string (markdown)",
    "salary": {
        "type": "exact | from | to | range | negotiable",
        "amount": "number | null",
        "amount_from": "number | null",
        "amount_to": "number | null",
        "period": "hour | week | month | year",
        "currency": "KZT | USD | EUR | string"
    },
    "country": "string",
    "city": "string"
}
```

> `description` хранится и передаётся как markdown-строка — форматирование (списки, заголовки, жирный текст и т.д.) рендерится на фронте.

**Response**
```json
{
    "job_id": "uuid",
    "title": "string",
    "description": "string (markdown)",
    "salary": {
        "type": "exact | from | to | range | negotiable",
        "amount": "number | null",
        "amount_from": "number | null",
        "amount_to": "number | null",
        "period": "hour | week | month | year",
        "currency": "string"
    },
    "country": "string",
    "city": "string",
    "organization_id": "uuid",
    "created_by": "uuid",
    "created_at": "datetime"
}
```

---

## GET /v1/jobs
Список вакансий (мобильное приложение, публичный просмотр).

**Auth** no need

**Query params:**
- `country` — фильтр по стране
- `city` — фильтр по городу
- `organization_id` — фильтр по организации

**Response**
```json
[
    {
        "job_id": "uuid",
        "title": "string",
        "salary": {
            "type": "exact | from | to | range | negotiable",
            "amount": "number | null",
            "amount_from": "number | null",
            "amount_to": "number | null",
            "period": "hour | week | month | year",
            "currency": "string"
        },
        "country": "string",
        "city": "string",
        "organization_id": "uuid",
        "created_at": "datetime"
    }
]
```

---

## GET /v1/jobs/{job_id}
Детали вакансии.

**Auth** no need

**Response**
```json
{
    "job_id": "uuid",
    "title": "string",
    "description": "string (markdown)",
    "salary": {
        "type": "exact | from | to | range | negotiable",
        "amount": "number | null",
        "amount_from": "number | null",
        "amount_to": "number | null",
        "period": "hour | week | month | year",
        "currency": "string"
    },
    "country": "string",
    "city": "string",
    "organization_id": "uuid",
    "organization_name": "string",
    "created_by": "uuid",
    "created_at": "datetime"
}
```

---

## PATCH /v1/jobs/{job_id}
Обновить вакансию.

**Auth** needed (role: `manager` или `owner`, в рамках своей `organization_id`)

**Request**
```json
{
    "title": "string",
    "description": "string (markdown)",
    "salary": {
        "type": "exact | from | to | range | negotiable",
        "amount": "number | null",
        "amount_from": "number | null",
        "amount_to": "number | null",
        "period": "hour | week | month | year",
        "currency": "string"
    },
    "country": "string",
    "city": "string"
}
```

**Response**
```json
{
    "job_id": "uuid",
    "updated_at": "datetime"
}
```

---

## DELETE /v1/jobs/{job_id}
Удалить вакансию.

**Auth** needed (role: `manager` или `owner`, в рамках своей `organization_id`)

**Response**
```json
{
    "success": true
}
```
