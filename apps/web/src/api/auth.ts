import type { AuthUser, UserProfile } from '@suma/types';
import { apiFetch } from './client';

export async function signIn(email: string, password: string): Promise<string | null> {
  const res = await fetch('/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
if (!res.ok) return null;
  return res.headers.get('set-auth-token');
}

export async function signOut(): Promise<void> {
  await fetch('/api/auth/sign-out', {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('suma-auth') ? JSON.parse(localStorage.getItem('suma-auth')!).state.token : ''}` },
  }).catch(() => {});
}

export async function getSession(): Promise<{ user: AuthUser } | null> {
  return apiFetch<{ user: AuthUser }>('/api/auth/get-session');
}

export async function listUsers(): Promise<import('@suma/types').AdminUser[]> {
  const data = await apiFetch<{ users: import('@suma/types').AdminUser[] }>(
    '/api/auth/admin/list-users?limit=100'
  );
  return data.users ?? [];
}

export async function adminCreateUser(data: import('@suma/types').CreateUserInput): Promise<void> {
  await apiFetch('/api/auth/admin/create-user', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function setUserRole(userId: string, role: string): Promise<void> {
  await apiFetch('/api/auth/admin/set-role', {
    method: 'POST',
    body: JSON.stringify({ userId, role }),
  });
}

export async function removeUser(userId: string): Promise<void> {
  await apiFetch('/api/auth/admin/remove-user', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/profile');
}

export async function updateProfile(data: { telegramId: string | null }): Promise<void> {
  await apiFetch('/api/profile', { method: 'PATCH', body: JSON.stringify(data) });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<string | null> {
  const token = (await import('../store/auth.store')).useAuthStore.getState().token;
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return body.message ?? body.error ?? 'Error al cambiar la contraseña';
  }
  return null;
}
