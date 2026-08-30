# Auth Endpoints

## POST /v1/auth/login
**Auth** no need

**Request**
```json
{
    "phone": "string"
}
```

**Response**
```json
{
    "attempt_id": "uuid",
    "is_registrated": false
}
```

---

## POST /v1/auth/confirm
**Auth** no need

**Request**
```json
{
    "attempt_id": "uuid",
    "password": "string"
}
```

**Response**
```json
{
    "user_id": "uuid",
    "token": {
        "access": "string",
        "refresh": "string"
    },
    "user": {
        "first_name": "string",
        "last_name": "string",
        "email": "string",
        "role": "user | manager | owner",
        "organization_id": "uuid | null"
    }
}
```

> Если `role` — `manager`/`owner` и `organization_id` — `null`, фронт (веб) должен показать экран **"Создать организацию"** или **"Присоединиться по коду"**.

---

## POST /v1/auth/register
**Auth** no need

**Request**
```json
{
    "attempt_id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "password": "string",
    "password_confirm": "string",
    "role": "user | manager"
}
```

> `role` передаётся с фронта в зависимости от платформы: мобильное приложение всегда шлёт `user`, веб — `manager`. `owner` не выбирается при регистрации — им становится `manager` после создания организации (см. `POST /v1/organizations`).

**Response**
```json
{
    "user_id": "uuid",
    "token": {
        "access": "string",
        "refresh": "string"
    },
    "user": {
        "first_name": "string",
        "last_name": "string",
        "email": "string",
        "role": "user | manager",
        "organization_id": null
    }
}
```

---

## GET /v1/auth/me
**Auth** needed

**Response**
```json
{
    "user_id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "role": "user | manager | owner",
    "organization_id": "uuid | null"
}
```

---

# Organization Endpoints

## POST /v1/organizations
Создать организацию. Вызывающий пользователь становится `owner`.

**Auth** needed (role: `manager`, `organization_id` должен быть `null`)

**Request**
```json
{
    "name": "string"
}
```

**Response**
```json
{
    "organization_id": "uuid",
    "name": "string",
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
    "invite_code": "string",
    "owner_id": "uuid",
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

---

# Roles Summary

| Роль | Платформа | Может |
|---|---|---|
| `user` | mobile | смотреть вакансии, чатиться с manager/owner |
| `manager` | web | создавать вакансии, чатиться с user (в рамках своей organization) |
| `owner` | web | всё что manager + создавать/удалять managers, управлять invite_code |
