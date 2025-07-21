import { API_BASE_URL } from './config';

export async function getMe() {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: 'include',
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export function login() {
  window.location.href = `${API_BASE_URL}/auth/google`;
}

export async function logout() {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw await res.json();
  return res.json();
} 