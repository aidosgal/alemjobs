import { apiFetch } from '@/lib/api/client';

export type UserRole = 'user' | 'manager' | 'owner';

export type AuthUser = {
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  organization_id: string | null;
};

export type AuthToken = {
  access: string;
  refresh: string;
};

export type LoginResponse = {
  attempt_id: string;
  is_registrated: boolean;
};

export type ConfirmResponse = {
  user_id: string;
  token: AuthToken;
  user: AuthUser;
};

export type RegisterPayload = {
  attempt_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
  role: 'user';
};

export function login(phone: string) {
  return apiFetch<LoginResponse>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function confirm(attemptId: string, password: string) {
  return apiFetch<ConfirmResponse>('/v1/auth/confirm', {
    method: 'POST',
    body: JSON.stringify({ attempt_id: attemptId, password }),
  });
}

export function register(payload: RegisterPayload) {
  return apiFetch<ConfirmResponse>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
