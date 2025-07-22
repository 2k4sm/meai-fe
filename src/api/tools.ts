import { API_BASE_URL } from './config';

export async function getToolkits() {
  const res = await fetch(`${API_BASE_URL}/toolkits/`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch toolkits');
  return res.json();
}

export async function connectToolkit(slug: string) {
  const res = await fetch(`${API_BASE_URL}/toolkits/connect/${slug}`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to initiate toolkit connection');
  return res.json();
}

export async function enableToolkit(slug: string) {
  const res = await fetch(`${API_BASE_URL}/toolkits/enable/${slug}`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to enable toolkit');
  return res.json();
}

export async function disableToolkit(slug: string) {
  const res = await fetch(`${API_BASE_URL}/toolkits/disable/${slug}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to disable toolkit');
  return res.json();
}

export async function getConnections() {
  const res = await fetch(`${API_BASE_URL}/toolkits/connections`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch toolkit connections');
  return res.json();
}

export async function getConnectionStatus(slug: string) {
  const res = await fetch(`${API_BASE_URL}/toolkits/connections/${slug}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch toolkit connection status');
  return res.json();
}

export async function syncConnection(connectionRequestId: string) {
  const res = await fetch(`${API_BASE_URL}/toolkits/connections/sync/${connectionRequestId}`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to sync toolkit connection');
  return res.json();
} 