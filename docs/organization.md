# Organization Endpoints

## POST /v1/organizations
Создать организацию. Вызывающий пользователь становится `owner`.

**Auth** needed (role: `manager`, `organization_id` должен быть `null`)

**Request**
```json
{
    "name": "string",
    "legal_name": "string",
    "country": "KZ | string",
    "city": "string",
    "legal_form": "ip | too | other",
    "bin_iin": "string",
    "address": "string",
    "timezone": "Asia/Almaty | string",
    "working_hours": {
        "from": "09:00",
        "to": "18:00"
    },
    "documents": [
        {
            "type": "registration_certificate | charter | other",
            "file_url": "string"
        }
    ]
}
```

**Поля по странам:**

| Страна | legal_form | bin_iin | Обязательные документы |
|---|---|---|---|
| Казахстан | `ip` | ИИН (12 цифр) | 1) Свидетельство/уведомление о регистрации ИП, 2) Удостоверение личности |
| Казахстан | `too` | БИН (12 цифр) | 1) Свидетельство о гос. регистрации ТОО, 2) Устав компании |
| Европа (общий случай) | `other` | VAT / рег. номер компании | 1) Сертификат о регистрации компании, 2) Учредительный документ (Articles of Association / аналог устава) |

> Точный список требуемых документов и валидация `bin_iin` (по маске страны) уточняются отдельно на этапе интеграции с юр. отделом / комплаенсом — здесь заложена только структура.

**Response**
```json
{
    "organization_id": "uuid",
    "name": "string",
    "legal_name": "string",
    "country": "string",
    "city": "string",
    "legal_form": "ip | too | other",
    "bin_iin": "string",
    "address": "string",
    "timezone": "string",
    "working_hours": {
        "from": "09:00",
        "to": "18:00"
    },
    "invite_code": "string",
    "role": "owner"
}
```

---

## POST /v1/organizations/join
Присоединиться к организации по коду. Вызывающий пользователь становится `manager`.

**Auth** needed (role: `manager`, `organization_id` должен быть `null`)

**Request**
```json
{
    "invite_code": "string"
}
```

**Response**
```json
{
    "organization_id": "uuid",
    "name": "string",
    "role": "manager"
}
```

---

## GET /v1/organizations/me
Информация об организации текущего пользователя.

**Auth** needed (role: `manager` или `owner`)

**Response**
```json
{
    "organization_id": "uuid",
    "name": "string",
    "legal_name": "string",
    "country": "string",
    "city": "string",
    "legal_form": "ip | too | other",
    "bin_iin": "string",
    "address": "string",
    "timezone": "string",
    "working_hours": {
        "from": "09:00",
        "to": "18:00"
    },
    "invite_code": "string",
    "owner_id": "uuid",
    "documents": [
        {
            "type": "registration_certificate | charter | other",
            "file_url": "string",
            "uploaded_at": "datetime"
        }
    ],
    "managers": [
        {
            "user_id": "uuid",
            "first_name": "string",
            "last_name": "string",
            "email": "string"
        }
    ]
}
```

---

## PATCH /v1/organizations/me
Обновить юридические данные организации.

**Auth** needed (role: `owner`)

**Request**
```json
{
    "legal_name": "string",
    "address": "string",
    "bin_iin": "string",
    "city": "string",
    "timezone": "string",
    "working_hours": {
        "from": "09:00",
        "to": "18:00"
    },
    "documents": [
        {
            "type": "registration_certificate | charter | other",
            "file_url": "string"
        }
    ]
}
```

**Response**
```json
{
    "organization_id": "uuid",
    "legal_name": "string",
    "address": "string",
    "bin_iin": "string",
    "city": "string",
    "timezone": "string",
    "working_hours": {
        "from": "09:00",
        "to": "18:00"
    }
}
```

---

## POST /v1/organizations/documents
Загрузить/заменить документ организации.

**Auth** needed (role: `owner`)

**Request**
```json
{
    "type": "registration_certificate | charter | other",
    "file_url": "string"
}
```

**Response**
```json
{
    "document_id": "uuid",
    "type": "registration_certificate | charter | other",
    "file_url": "string",
    "uploaded_at": "datetime"
}
```

---

## POST /v1/organizations/regenerate-code
Перегенерировать код приглашения (например, если утёк).

**Auth** needed (role: `owner`)

**Response**
```json
{
    "invite_code": "string"
}
```

---

## DELETE /v1/organizations/managers/{user_id}
Удалить менеджера из организации.

**Auth** needed (role: `owner`)

**Response**
```json
{
    "success": true
}
```
