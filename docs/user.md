# User Endpoints

## GET /v1/users/me
Профиль текущего пользователя.

**Auth** needed

**Response**
```json
{
    "user_id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string",
    "role": "user | manager | owner",
    "organization_id": "uuid | null"
}
```

---

## PATCH /v1/users/me
Обновить профиль текущего пользователя.

**Auth** needed

> `phone`, `role`, `organization_id` через этот эндпоинт не меняются.

**Request**
```json
{
    "first_name": "string",
    "last_name": "string",
    "email": "string"
}
```

**Response**
```json
{
    "user_id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string",
    "role": "user | manager | owner",
    "organization_id": "uuid | null"
}
```

---

## POST /v1/users/change-password
Сменить пароль, зная текущий (пользователь уже авторизован).

**Auth** needed

**Request**
```json
{
    "old_password": "string",
    "new_password": "string",
    "new_password_confirm": "string"
}
```

**Response**
```json
{
    "success": true
}
```

---

## POST /v1/users/forgot-password
Начать восстановление пароля по номеру телефона (пользователь пароль забыл, не авторизован).

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
    "attempt_id": "uuid"
}
```

> Тот же паттерн `attempt_id`, что и в `POST /v1/auth/login` (см. `docs/auth.md`). Если номер не зарегистрирован — эндпоинт всё равно возвращает `attempt_id`, чтобы не раскрывать существование аккаунта; `POST /v1/users/reset-password` для такого `attempt_id` всегда завершится ошибкой.

---

## POST /v1/users/reset-password
Завершить восстановление пароля по `attempt_id`, полученному от `forgot-password`.

**Auth** no need

**Request**
```json
{
    "attempt_id": "uuid",
    "new_password": "string",
    "new_password_confirm": "string"
}
```

**Response**
```json
{
    "success": true
}
```
