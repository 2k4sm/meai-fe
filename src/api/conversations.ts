import { API_BASE_URL } from './config';

export async function listConversations() {
  const res = await fetch(`${API_BASE_URL}/conversations`, {
    credentials: 'include',
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function createConversation(title: string) {
  const res = await fetch(`${API_BASE_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function deleteConversation(conversationId: number) {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function updateConversationTitle(conversationId: number, title: string) {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
} 